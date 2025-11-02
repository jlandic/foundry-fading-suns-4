import { CharacteristicsGroupMap, CharacteristicsGroups, ResistanceTypes, Skills } from "../../system/references.mjs";
import { RollData, RollIntention, RollTypes } from "../../system/rolls.mjs";
import { enrichHTML } from "../../utils/text-editor.mjs";
import { BaseSheetMixin } from "../base-sheet-mixin.mjs";

export default class BaseActorSheet extends BaseSheetMixin(
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.sheets.ActorSheetV2,
    )
) {
    locked = true;

    static DEFAULT_OPTIONS = {
        position: { width: 650, height: "auto" },
        window: {
            icon: "fas fa-user-astronaut",
            resizable: true,
            contentClasses: ["actor"],
        },
        tag: "form",
        form: {
            submitOnChange: true,
        },
        dragDrop: [{ dragSelector: '[draggable]' }],
        actions: {
            toggleLock: BaseActorSheet._toggleLock,
            showImage: BaseActorSheet._showImage,
            openReference: BaseActorSheet._openReference,
            clearReference: BaseActorSheet._clearReference,
            bankVP: BaseActorSheet._bankVP,
            emptyCache: BaseActorSheet._emptyCache,
            surge: BaseActorSheet._surge,
            revival: BaseActorSheet._revival,
            respite: BaseActorSheet._respite,
            viewItem: BaseActorSheet._viewItem,
            deleteItem: BaseActorSheet._deleteItem,
            roll: BaseActorSheet._roll,
            toggleEquip: BaseActorSheet._toggleEquip,
        },
    };

    static PARTS = {
        header: { template: "systems/fading-suns-4/templates/actor/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        stats: { template: "systems/fading-suns-4/templates/actor/stats.hbs", scrollable: [""] },
        statsExtra: { template: "systems/fading-suns-4/templates/actor/stats-extra.hbs", scrollable: [""] },
        features: { template: "systems/fading-suns-4/templates/actor/features.hbs", scrollable: [""] },
        inventory: { template: "systems/fading-suns-4/templates/actor/inventory.hbs", scrollable: [""] },
        notes: { template: "systems/fading-suns-4/templates/actor/notes.hbs", scrollable: [""] },
        modifiers: { template: "systems/fading-suns-4/templates/shared/parts/modifiers.hbs", scrollable: [""] },
    };

    static TAB_REFERENCES = {
        stats: {
            id: "stats",
            cssClass: "tab-stats",
            label: "fs4.sheets.tabs.stats",
        },
        statsExtra: {
            id: "statsExtra",
            cssClass: "tab-stats-extra",
            label: "fs4.sheets.tabs.statsExtra",
        },
        features: {
            id: "features",
            cssClass: "tab-features",
            label: "fs4.sheets.tabs.features",
        },
        modifiers: {
            id: "modifiers",
            cssClass: "tab-modifiers",
            label: "fs4.sheets.tabs.modifiers",
        },
        inventory: {
            id: "inventory",
            cssClass: "tab-inventory",
            label: "fs4.sheets.tabs.inventory",
        },
        notes: {
            id: "notes",
            cssClass: "tab-notes",
            label: "fs4.sheets.tabs.notes",
        }
    };

    static TABS = {
        primary: {
            tabs: [
                BaseActorSheet.TAB_REFERENCES.stats,
                BaseActorSheet.TAB_REFERENCES.features,
                BaseActorSheet.TAB_REFERENCES.inventory,
                BaseActorSheet.TAB_REFERENCES.modifiers,
            ].filter(Boolean),
            initial: "stats",
        }
    };

    static INLINE_ITEM_CONTROLS = [
        {
            icon: "eye",
            i18nKey: "fs4.sheets.common.view",
            action: "viewItem",
            requiresEdit: false,
        },
        {
            icon: "trash",
            i18nKey: "fs4.sheets.common.delete",
            action: "deleteItem",
            requiresEdit: true,
        },
    ];

    get includeModifiers() {
        return this.actor.type !== "extra";
    }

    get includeInventory() {
        return this.actor.type !== "extra";
    }

    get includeNotes() {
        return this.actor.system.notes !== undefined;
    }

    get droppableAsReferences() {
        return [
            "species",
            "faction",
            "class",
            "calling",
            "affliction",
            "blessing",
            "curse",
        ];
    }

    get droppableAsEmbedded() {
        return [
            "equipment",
            "maneuver",
            "state",
            "capability",
            "perk",
            "weapon",
            "armor",
            "handshield",
            "eshield",
            "power",
        ];
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        options.parts = [
            "header",
            "tabs",
            "stats",
            "features",
            this.includeInventory ? "inventory" : null,
            this.includeModifiers ? "modifiers" : null,
            this.includeNotes ? "notes" : null
        ].filter(Boolean);
    }

    _onRender(context, options) {
        super._onRender(context, options);

        new foundry.applications.ux.DragDrop.implementation({
            callbacks: {
                drag: this._onDragStart.bind(this),
            }
        }).bind(this.element);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        let skills = [];
        if (this.actor.system.skills) {
            skills = Object.values(Skills).map((skill) => ({
                name: `system.skills.${skill}`,
                label: game.i18n.localize(`fs4.skills.${skill}`),
                value: this.actor.system.skills[skill],
                rollType: RollTypes.Skill,
                rollData: {
                    slug: skill,
                },
            })).sort((a, b) => a.label.localeCompare(b.label));
        }

        let characteristics = [];
        if (this.actor.system.characteristics) {
            characteristics = Object.values(CharacteristicsGroups).reduce((acc, group) => {
                const groupCharacteristics = CharacteristicsGroupMap[group].map((characteristic) => ({
                    name: `system.characteristics.${characteristic}`,
                    label: game.i18n.localize(`fs4.characteristics.${characteristic}`),
                    value: this.actor.system.characteristics[characteristic],
                }));

                return {
                    ...acc,
                    [group]: groupCharacteristics,
                };
            }, {});
        }

        const resistance = Object.values(ResistanceTypes).map((type) => ({
            name: `system.resistance.${type}`,
            label: game.i18n.localize(`fs4.resistance.${type}`),
            value: this.actor.resistance[type],
        }));

        foundry.utils.mergeObject(context, {
            system: this.actor.system,
            actor: this.actor.toObject(),
            isLocked: this.locked,
            isEditable: !this.locked && this.isEditable,
            isPc: this.actor.type === "pc",
            isExtra: this.actor.type === "extra",
            isUserGM: game.user.isGM,
            description: await enrichHTML(this.actor.system.description),
            gmNotes: game.user.isGM ? await enrichHTML(this.actor.system.gmNotes) : null,
            species: await this._prepareReferenceLink("system.species", "species"),
            class: await this._prepareReferenceLink("system.class", "class"),
            faction: await this._prepareReferenceLink("system.faction", "faction"),
            calling: await this._prepareReferenceLink("system.calling", "calling"),
            affliction: await this._prepareReferenceLink("system.affliction", "affliction"),
            blessing: await this._prepareReferenceLink("system.blessing", "blessing"),
            curse: await this._prepareReferenceLink("system.curse", "curse"),
            skillsLeftColumn: skills.slice(0, skills.length / 2),
            skillsRightColumn: skills.slice(skills.length / 2),
            characteristics,
            resistance,
            isResistanceEditable: this.isEditable && !!this.actor.system.resistance,
            perks: await this._prepareItemList("perk", {
                description: "fs4.commonFields.description",
                benefice: "fs4.perk.fields.benefice",
            }),
            capabilities: await this._prepareItemList("capability", {
                description: "fs4.commonFields.description",
            }),
            equipment: await this._prepareItemList("equipment", {
                description: "fs4.commonFields.description",
            }, { equippable: true }),
            weapons: await this._prepareItemList("weapon", {
                description: "fs4.commonFields.description",
            }, { equippable: true }),
            maneuvers: await this._prepareItemList("maneuver", {
                description: "fs4.commonFields.description",
                impact: "fs4.maneuver.fields.impact",
            }, {
                draggable: true,
                rollData: (maneuver) => ({
                    slug: maneuver.system.slug,
                    rollType: RollTypes.Maneuver,
                }),
                transformName: (maneuver) => {
                    const rollIntention = new RollIntention({ maneuver });
                    const goal = new RollData({ actor: this.actor, rollIntention }).baseGoal;

                    return `${maneuver.name} (${goal})`;
                }
            }),
            states: await this._prepareItemList("state", {
                description: "fs4.commonFields.description",
            }),
        });

        return context;
    }

    async _onDrop(event) {
        if (event.target.classList.values().toArray().includes('editor-container')) { return; }

        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const item = await fromUuid(data.uuid);

        if (this.droppableAsReferences.includes(item.type)) {
            await this.actor.addReference(`system.${item.type}`, item.system.slug);
        } else if (this.droppableAsEmbedded.includes(item.type)) {
            await this.actor.createEmbeddedDocuments("Item", [item.toObject()]);
        } else {
            globalThis.log.warn(`Unsupported drop item type: ${item.type}`);
        }
    }

    _onDragStart(event) {
        event.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
                type: event.currentTarget.dataset.type,
                itemId: event.currentTarget.dataset.id,
                actorId: this.actor.id,
            })
        )
    }

    async _prepareItemList(type, details, options = { equippable: false, draggable: false, sort: true, rollData: null, transformName: null }) {
        const items = this.actor.items.filter(item => item.type === type);

        if (options.sort) {
            items.sort((a, b) => a.name.localeCompare(b.name));
        }

        return await Promise.all(items.map(async (item) => ({
            id: item.id,
            type: item.type,
            img: item.img,
            draggable: options.draggable,
            label: options.transformName ? options.transformName(item) : item.name,
            rollData: options.rollData ? options.rollData(item) : null,
            equippable: options.equippable,
            isEquipped: options.equippable ? (this.actor.getFlag("fading-suns-4", `equipped.${item.id}`) ?? false) : false,
            controls: BaseActorSheet.INLINE_ITEM_CONTROLS
                .filter(control => control.requiresEdit ? this.isEditable : true)
                .map(control => ({
                    ...control,
                    label: game.i18n.localize(control.i18nKey),
                })),
            details: await Promise.all(Object.keys(details).map(async field => ({
                label: game.i18n.localize(details[field]),
                value: await enrichHTML(item.system[field] || "")
            }))),
        })));
    }

    /**
     * ACTIONS
     */

    static async _toggleLock(event) {
        event.preventDefault();
        this.locked = !this.locked;
        this.render();
    }

    static async _roll(event, target) {
        event.preventDefault();

        switch (target.dataset.rollType) {
            case RollTypes.Skill:
                await this.actor.rollSkill(target.dataset.rollAttribute);
                break;
            case RollTypes.Maneuver:
                await this.actor.rollManeuver(target.dataset.rollAttribute);
                break;
        }
    }

    static async _showImage(event, target) {
        event.preventDefault();
        const {
            dataset: {
                src,
                id,
                name,
            },
        } = target;

        const popout = new foundry.applications.apps.ImagePopout({
            src,
            id,
            window: {
                title: name,
            },
        });

        popout.render(true);
    }

    static async _openReference(event, target) {
        event.preventDefault();
        const { uuid } = target.dataset;

        const item = await fromUuid(uuid);

        if (item) {
            item.sheet.render(true);
        }
    }

    static async _clearReference(event, target) {
        event.preventDefault();
        const { name } = target.dataset;

        this.actor.removeReference(name);
    }

    static async _bankVP(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        await this.actor.bankVP();
    }

    static async _emptyCache(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        await this.actor.emptyCache();
    }

    static async _surge(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        await this.actor.surge();
    }

    static async _revival(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        await this.actor.revival();
    }

    static async _respite(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        await this.actor.respite();
    }

    static _viewItem(event, target) {
        event.preventDefault();
        const item = this.actor.items.get(target.dataset.id);

        if (item) {
            item.sheet.render(true);
        }
    }

    static async _deleteItem(event, target) {
        event.preventDefault();
        if (!this.isEditable) return;

        await this.actor.deleteEmbeddedDocuments("Item", [target.dataset.id]);
    }

    static _toggleEquip(event, target) {
        event.preventDefault();
        if (!this.isEditable) return;

        this.actor.toggleEquip(target.dataset.id);
    }
}
