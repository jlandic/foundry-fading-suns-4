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
            perk: await this._prepareReference("system.perk", "perk"),
            perks: await this._prepareReferenceList("system.perks", "perk"),
        });

        return context;
    }
}
