import { CapabilityCategories, PreconditionTypes, SPECIAL_REFERENCE_PREFIX } from "../../system/references.mjs";
import { enrichHTML } from "../../utils/text-editor.mjs";
import { BaseSheetMixin } from "../base-sheet-mixin.mjs";

const TYPE_PARTS = [
    "affliction",
    "calling",
    "capability",
    "class",
    "faction",
    "maneuver",
    "perk",
    "species",
    "simpleItem",
    "equipment",
    "weapon",
    "armor",
    "shield",
    "eshield",
];

const READ_ONLY_REFERENCE_TYPES = [
    "affliction",
    "blessing",
    "calling",
    "class",
    "curse",
    "faction",
    "species",
];

export default class BaseItemSheet extends BaseSheetMixin(
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.sheets.ItemSheetV2,
    )
) {
    static DEFAULT_OPTIONS = {
        position: { width: 600, height: "auto" },
        window: {
            icon: "fas fa-box-open",
            resizable: true,
            contentClasses: ["item"],
        },
        tag: "form",
        form: {
            submitOnChange: true,
        },
        actions: {
            addModifier: BaseItemSheet._addModifier,
            toggleModifier: BaseItemSheet._toggleModifier,
            editModifier: BaseItemSheet._editModifier,
            removeModifier: BaseItemSheet._removeModifier,
            viewItem: BaseItemSheet._viewInlineItem,
            deleteItem: BaseItemSheet._deleteInlineItem,
            openReference: BaseItemSheet._openReference,
            clearReference: BaseItemSheet._clearReference,
        },
    };

    static PARTS = {
        header: { template: "systems/fading-suns-4/templates/item/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        ...TYPE_PARTS.reduce((acc, type) => {
            acc[type] = { template: `systems/fading-suns-4/templates/item/${type}.hbs`, scrollable: [""] };
            return acc;
        }, {}),
        modifiers: { template: "systems/fading-suns-4/templates/shared/parts/modifiers.hbs", scrollable: [""] },
    };

    static TABS = {
        primary: {
            tabs: [],
            initial: null,
        }
    }

    static TAB_REFERENCES = {
        main: {
            id: "main",
            cssClass: "tab-main",
            label: "fs4.sheets.tabs.main",
        },
        modifiers: {
            id: "modifiers",
            cssClass: "tab-modifiers",
            label: "fs4.sheets.tabs.modifiers",
        },
    }

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

    get typePart() {
        return this.item.type;
    }

    get includeModifiers() {
        return this.constructor.TABS.primary.tabs.some(tab => tab.id === "modifiers");
    }

    get includeTabs() {
        return this.constructor.TABS.primary.tabs.length > 0;
    }

    get droppableAsReferences() {
        return [];
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        options.parts = [
            "header",
            this.includeTabs ? "tabs" : null,
            this.typePart,
            this.includeModifiers ? "modifiers" : null,
        ].filter(Boolean);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            system: this.item.system,
            item: this.item.toObject(),
            isEditable: !READ_ONLY_REFERENCE_TYPES.includes(this.item.type),
            description: await enrichHTML(this.item.system.description),
            modifiers: this._prepareModifiers(),
        });

        return context;
    }

    _onRender(context, options) {
        super._onRender(context, options);

        new foundry.applications.ux.DragDrop.implementation({
            callbacks: {
                drop: this._onDrop.bind(this),
            }
        }).bind(this.element);
    }

    async _onDrop(event) {
        if (event.target.classList.values().toArray().includes("editor-container")) return;

        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const item = await fromUuid(data.uuid);

        if (this.droppableAsReferences.includes(item.type)) {
            await this.item.addReference(`system.${item.type}`, item.system.slug);
        } else {
            globalThis.log.warn(`Unsupported drop item type: ${item.type}`);
        }
    }

    async _prepareReferenceList(path, type, options = { sort: true }) {
        const list = await Promise.all(foundry.utils.getProperty(this.item, path).map(async (slug) => {
            if (slug.startsWith(SPECIAL_REFERENCE_PREFIX)) {
                const text = game.i18n.localize(`fs4.${type}.special.${slug}`);

                return {
                    html: await enrichHTML(`<em>${text}</em>`),
                    // force at the end of the list, alphabetically
                    name: `zzz`,
                }
            }

            const html = await enrichHTML(`@SLUG[${type}:${slug}]`);
            const item = globalThis.registry.fromSlug(slug, type);

            return {
                html,
                name: item?.name,
            };
        }));

        const sorted = options.sort ? list.sort((a, b) => a?.name?.localeCompare(b?.name) || -1) : list;
        return sorted.map(entry => entry.html);
    }

    async _prepareInlineItemList(path, type) {
        const list = await Promise.all(foundry.utils.getProperty(this.item, path).map(async (slug) => {
            return await globalThis.registry.fromSlugAsync(slug, type);
        }));

        return await Promise.all(list.map(async (item) => ({
            id: item.system.slug,
            label: item.name,
            type: item.type,
            controls: BaseItemSheet.INLINE_ITEM_CONTROLS
                .filter(control => control.requiresEdit ? this.isEditable : true)
                .map(control => ({
                    ...control,
                    name: path,
                    label: game.i18n.localize(control.i18nKey),
                })),
            details: [{
                label: game.i18n.localize("fs4.commonFields.description"),
                value: await enrichHTML(item.system.description),
            }],
        })));
    }

    async _prepareChoicesSet(property, transformOption, optionSeparator) {
        return await Promise.all(foundry.utils.getProperty(this.item, property).map(async (choice) => {
            const choices = await Promise.all(choice.map(transformOption));
            return choices.join(optionSeparator)
        }));
    }

    async _preparePreconditions(path = "system.preconditions") {
        return await this._prepareChoicesSet(
            path,
            async (condition) => {
                if (condition.type === PreconditionTypes.Special) {
                    return game.i18n.localize(`fs4.preconditions.special.${condition.slug}`);
                } else if (condition.type === PreconditionTypes.Skill) {
                    const skillName = game.i18n.localize(`fs4.skills.${condition.slug}`);
                    return `${skillName} ${condition.value}+`;
                } else {
                    return await enrichHTML(`@SLUG[${condition.type}:${condition.slug}]`)
                }
            },
            game.i18n.localize("fs4.common.orSeparator"),
        );
    }

    async _prepareSlugValueChoice(path, i18nPrefix) {
        return await this._prepareChoicesSet(
            path,
            (option) => {
                if (option.slug.startsWith(SPECIAL_REFERENCE_PREFIX)) {
                    return game.i18n.format(`${i18nPrefix}.special.${option.slug}`, { value: option.value });
                }

                const name = game.i18n.localize(`${i18nPrefix}.${option.slug}`);
                return `${name} +${option.value}`;
            },
            game.i18n.localize("fs4.common.orSeparator")
        )
    }

    async _prepareCapabilitiesChoice(path = "system.capabilities") {
        return await this._prepareChoicesSet(
            path,
            async (slug) => {
                if (slug.startsWith(SPECIAL_REFERENCE_PREFIX)) {
                    return game.i18n.localize(`fs4.capability.special.${slug}`);
                }
                if (Object.values(CapabilityCategories).includes(slug)) {
                    return game.i18n.format(
                        "fs4.capability.special.anyInCategory",
                        { category: game.i18n.localize(`fs4.capability.categories.${slug}`) }
                    )
                }

                return await enrichHTML(`@SLUG[capability:${slug}]`)
            },
            game.i18n.localize("fs4.common.orSeparator")
        );
    }

    async _prepareCharacteristicsChoice(path = "system.characteristics") {
        return await this._prepareSlugValueChoice(path, "fs4.characteristics");
    }

    async _prepareSkillsChoice(path = "system.skills") {
        return await this._prepareSlugValueChoice(path, "fs4.skills");
    }

    async _preparePowerSkillsChoice(path = "system.powerSkills") {
        return await this._prepareSlugValueChoice(path, "fs4.powerSkills");
    }

    static async _viewInlineItem(event, target) {
        event.preventDefault();

        const slug = target.dataset.id;
        const item = await globalThis.registry.fromSlugAsync(slug, target.dataset.type);
        item.sheet.render(true);
    }

    static async _deleteInlineItem(event, target) {
        event.preventDefault();

        const slug = target.dataset.id;
        const path = target.dataset.name;

        const list = foundry.utils.getProperty(this.item, path);
        const index = list.indexOf(slug);
        if (index !== -1) {
            list.splice(index, 1);
            await this.item.update({ [path]: list });
            await this.item.clearImportedEffects(slug);
        }
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

        this.item.removeReference(name);
    }
}
