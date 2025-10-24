import { enrichHTML } from "../../utils/text-editor.mjs";
import { BaseSheetMixin } from "../base-sheet-mixin.mjs";

export default class BaseActorSheet extends BaseSheetMixin(
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.sheets.ActorSheetV2,
    )
) {
    static DEFAULT_OPTIONS = {
        position: { width: 800, height: "auto" },
        window: {
            icon: "fas fa-user-astronaut",
            resizable: true,
            contentClasses: ["actor"],
        },
        tag: "form",
        form: {
            submitOnChange: true,
        },
        actions: {},
    };

    static PARTS = {
        header: { template: "systems/fading-suns-4/templates/actor/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        stats: { template: "systems/fading-suns-4/templates/actor/stats.hbs", scrollable: [".scrollable"] },
        statsExtra: { template: "systems/fading-suns-4/templates/actor/stats-extra.hbs", scrollable: [".scrollable"] },
        features: { template: "systems/fading-suns-4/templates/actor/features.hbs", scrollable: [".scrollable"] },
        equipment: { template: "systems/fading-suns-4/templates/actor/equipment.hbs", scrollable: [".scrollable"] },
        notes: { template: "systems/fading-suns-4/templates/actor/notes.hbs", scrollable: [".scrollable"] },
        modifiers: { template: "systems/fading-suns-4/templates/shared/parts/modifiers.hbs", scrollable: [".scrollable"] },
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
        equipment: {
            id: "equipment",
            cssClass: "tab-equipment",
            label: "fs4.sheets.tabs.equipment",
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
                BaseActorSheet.TAB_REFERENCES.modifiers,
                BaseActorSheet.TAB_REFERENCES.equipment,
                BaseActorSheet.TAB_REFERENCES.gmNotes,
            ].filter(Boolean),
            initial: "stats",
        }
    };

    get includeModifiers() {
        return this.actor.type !== "extra";
    }

    get includeEquipment() {
        return this.actor.type !== "extra";
    }

    get includeNotes() {
        return this.actor.system.notes !== undefined;
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        options.parts = [
            "header",
            "tabs",
            "stats",
            "features",
            this.includeModifiers ? "modifiers" : null,
            this.includeEquipment ? "equipment" : null,
            this.includeNotes ? "notes" : null
        ].filter(Boolean);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            system: this.actor.system,
            actor: this.actor.toObject(),
            isEditable: this.isEditable,
            isPc: this.actor.type === "pc",
            isExtra: this.actor.type === "extra",
            isUserGM: game.user.isGM,
            description: await enrichHTML(this.actor.system.description),
            gmNotes: game.user.isGM ? await enrichHTML(this.actor.system.gmNotes) : null,
            species: await this._prepareReference("system.species", "species"),
        });

        return context;
    }
}
