import { PreconditionTypes } from "../../system/references.mjs";
import { enrichHTML } from "../../utils/text-editor.mjs";

const TYPE_PARTS = [
    "affliction",
    "class",
    "perk",
    "species",
];

const READ_ONLY_REFERENCE_TYPES = [
    "affliction",
    "class",
    "perk",
    "species",
];

export default class BaseItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.sheets.ItemSheetV2,
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
        actions: {},
    };

    static PARTS = {
        header: { template: "systems/fading-suns-4/templates/item/parts/header.hbs" },
        tabs: { template: "templates/generic/tab-navigation.hbs" },
        ...TYPE_PARTS.reduce((acc, type) => {
            acc[type] = { template: `systems/fading-suns-4/templates/item/${type}.hbs`, scrollable: [".scrollable"] };
            return acc;
        }, {}),
        modifiers: { template: "systems/fading-suns-4/templates/item/parts/modifiers.hbs", scrollable: [".scrollable"] },
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

    get typePart() {
        return this.item.type;
    }

    get includeModifiers() {
        return this.constructor.TABS.primary.tabs.some(tab => tab.id === "modifiers");
    }

    get includeTabs() {
        return this.constructor.TABS.primary.tabs.length > 0;
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        console.log(options);

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
        });

        return context;
    }

    async _prepareReference(path, type) {
        const slug = foundry.utils.getProperty(this.item, path);
        const uuid = globalThis.registry.uuidFromSlug(slug, type);
        return await enrichHTML(`@UUID[${uuid}]`);
    }

    async _prepareReferenceList(path, type, options = { sort: true }) {
        const list = await Promise.all(foundry.utils.getProperty(this.item, path).map(async (slug) => {
            const item = await globalThis.registry.fromSlug(slug, type);
            const html = await enrichHTML(`@UUID[${item.uuid}]`);

            return {
                html,
                name: item.name,
            };
        }));

        const sorted = options.sort ? list.sort((a, b) => a.name.localeCompare(b.name)) : list;
        return sorted.map(entry => entry.html);
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
                    const uuid = globalThis.registry.uuidFromSlug(condition.slug, condition.type);
                    return await enrichHTML(`@UUID[${uuid}]`, { async: false })
                }
            },
            game.i18n.localize("fs4.common.orSeparator"),
        );
    }

    async _prepareSlugValueChoice(path, i18nPrefix) {
        return await this._prepareChoicesSet(
            path,
            (option) => {
                const name = game.i18n.localize(`${i18nPrefix}.${option.slug}`);
                return `${name} +${option.value}`;
            },
            game.i18n.localize("fs4.common.orSeparator")
        )
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
}
