import BaseItemSheet from "./base-item-sheet.mjs";

export default class FactionSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            characteristics: await this._prepareCharacteristicsChoice(),
            skills: await this._prepareSkillsChoice(),
            perk: await this._prepareReference("system.perk", "perk"),
            blessing: await this._prepareReference("system.blessing", "blessing"),
            curse: await this._prepareReference("system.curse", "curse"),
            // equipment: await this._prepareReference("system.equipment"),
            // favoredCalling: await this._prepareReference("system.favoredCalling", "calling"),
        });

        return context;
    }
}
