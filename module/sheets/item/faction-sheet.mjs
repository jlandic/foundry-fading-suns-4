import BaseItemSheet from "./base-item-sheet.mjs";

export default class FactionSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const blessings = await this._prepareReferenceList("system.blessing", "blessing");

        foundry.utils.mergeObject(context, {
            characteristics: await this._prepareCharacteristicsChoice(),
            skills: await this._prepareSkillsChoice(),
            perk: await this._prepareReference("system.perk", "perk"),
            blessing: blessings.join(game.i18n.localize("fs4.common.orSeparator")),
            curse: await this._prepareReference("system.curse", "curse"),
            capabilities: await this._prepareCapabilitiesChoice(),
            // equipment: await this._prepareReference("system.equipment"),
            favoredCalling: await this._prepareReference("system.favoredCalling", "calling"),
        });

        return context;
    }
}
