import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

export default class CallingSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            characteristics: await this._prepareCharacteristicsChoice(),
            skills: await this._prepareSkillsChoice(),
            preconditions: await this._preparePreconditions(),
            perks: await this._prepareReferenceList("system.perks", "perk"),
            capabilities: await this._prepareCapabilitiesChoice(),
            equipment: await this._prepareEquipmentChoice("system.equipment"),
            patrons: await enrichHTML(this.item.system.patrons),
        });

        return context;
    }
}
