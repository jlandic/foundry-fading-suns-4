import { Characteristics, InitiativeModifierTypes, ModifierContexts, ModifierTargetTypes, ModifierValueTypes, ResistanceTypes, Skills } from "../../system/references.mjs";
import { BaseSheetMixin } from "../base-sheet-mixin.mjs";

export default class ModifierSheet extends BaseSheetMixin(
    foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.sheets.ActiveEffectConfig,
    )
) {
    static DEFAULT_OPTIONS = {
        position: { width: 500, height: "auto" },
        window: {
            icon: "fas fa-sliders-h",
            resizable: true,
            contentClasses: ["item", "modifier"],
        },
        tag: "form",
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
        },
        actions: {},
    };

    static PARTS = {
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        modifier: {
            template: "systems/fading-suns-4/templates/activeeffect/modifier.hbs",
            scrollable: [""],
        },
        duration: {
            template: "systems/fading-suns-4/templates/activeeffect/duration.hbs",
            scrollable: [""],
        },
    };

    static TABS = {
        primary: {
            tabs: [
                {
                    id: "modifier",
                    cssClass: "tab-modifier",
                    label: "fs4.sheets.tabs.modifier",
                },
                {
                    id: "duration",
                    cssClass: "tab-duration",
                    label: "fs4.sheets.tabs.duration",
                }
            ],
            initial: "modifier",
        }
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        options.parts = [
            "tabs",
            "modifier",
            "duration",
        ];
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const targetOptions = this._prepareTargetOptions();

        foundry.utils.mergeObject(context, {
            name: this.document.name,
            system: this.document.system,
            displayValue: [ModifierValueTypes.Constant, ModifierValueTypes.Formula].includes(this.document.system.valueType),
            displayManeuver: this.document.system.targetType === ModifierTargetTypes.Maneuver,
            displayTarget: targetOptions.length > 0,
            targetOptions,
            valueTypeOptions: this._prepareSelectOptions(
                Object.values(ModifierValueTypes),
                this.document.system.valueType,
                "fs4.modifier.valueTypes"
            ),
            contextOptions: this._prepareSelectOptions(
                Object.values(ModifierContexts),
                this.document.system.context,
                "fs4.modifier.contexts"
            ),
            targetTypeOptions: this._prepareSelectOptions(
                Object.values(ModifierTargetTypes),
                this.document.system.targetType,
                "fs4.modifier.targetTypes"
            ),
            maneuverOptions: await this._prepareManeuverOptions(),
        });

        return context;
    }

    async _prepareManeuverOptions() {
        const maneuvers = await globalThis.registry.getAllOfType("maneuver");
        return maneuvers.map(maneuver => ({
            label: maneuver.name,
            value: maneuver.system.slug,
            selected: maneuver.system.slug === this.document.system.target,
        }));
    }

    _prepareTargetOptions() {
        switch (this.document.system.targetType) {
            case ModifierTargetTypes.Skill:
                return this._prepareSelectOptions(
                    Object.values(Skills),
                    this.document.system.target,
                    "fs4.skills",
                    { sort: true }
                );
            case ModifierTargetTypes.Characteristic:
                return this._prepareSelectOptions(
                    Object.values(Characteristics),
                    this.document.system.target,
                    "fs4.characteristics",
                    { sort: true }
                );
            case ModifierTargetTypes.Resistance:
                return this._prepareSelectOptions(
                    Object.values(ResistanceTypes),
                    this.document.system.target,
                    "fs4.resistances",
                );
            case ModifierTargetTypes.Initiative:
                return this._prepareSelectOptions(
                    Object.values(InitiativeModifierTypes),
                    this.document.system.target,
                    "fs4.modifier.initiativeModifierTypes",
                );
            default:
                return [];
        }
    }
}
