import BaseItemSheet from "./base-item-sheet.mjs";

export default class SpeciesSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            powerSkills: await this._preparePowerSkillsChoice(),
            perks: await this._prepareReferenceList("system.perks", "perk"),
        });

        return context;
    }
}
