import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

export default class ClassSheet extends BaseItemSheet {
    static TABS = {
        primary: {
            initial: "main",
            tabs: [
                this.TAB_REFERENCES.main,
                this.TAB_REFERENCES.modifiers,
            ]
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            characteristics: await this._prepareCharacteristicsChoice(),
            skills: await this._prepareSkillsChoice(),
            capabilities: await this._prepareCapabilitiesChoice(),
            perk: await this._prepareReference("system.perk", "perk"),
            perks: await this._prepareReferenceList("system.perks", "perk"),
            factions: await this._prepareReferenceList("system.factions", "faction"),
            callings: await this._prepareCallings(),
        });

        return context;
    }

    async _prepareCallings() {
        const callings = await globalThis.registry.getAllOfType("calling");
        let openCallings = [];
        let classCallings = [];

        callings.forEach((calling) => {
            if (calling.system.isOpen) {
                openCallings.push(calling);
            } else {
                const inClass = calling.system.preconditions.some((conditions) => {
                    return conditions.some((condition) => condition.type === "class" && condition.slug === this.item.system.slug);
                });

                if (inClass) {
                    classCallings.push(calling);
                }
            }
        });

        const mapFn = async (item) => ({
            html: await enrichHTML(`@SLUG[calling:${item.system.slug}]`),
            name: item.name
        });

        classCallings = await Promise.all(classCallings.map(mapFn));
        openCallings = await Promise.all(openCallings.map(mapFn));

        return {
            classCallings: classCallings.sort((a, b) => a.name.localeCompare(b.name)).map(calling => calling.html),
            openCallings: openCallings.sort((a, b) => a.name.localeCompare(b.name)).map(calling => calling.html),
        };
    }
}
