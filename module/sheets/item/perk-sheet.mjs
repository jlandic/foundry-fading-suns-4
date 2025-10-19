import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

export default class PerkSheet extends BaseItemSheet {
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
            benefice: await enrichHTML(this.item.system.benefice),
            preconditions: await this._preparePreconditions(),
            previousLevel: this.item.system.previousLevel ? await enrichHTML(`@SLUG[perk:${this.item.system.previousLevel}]`) : null,
            nextLevel: this.item.system.nextLevel ? await enrichHTML(`@SLUG[perk:${this.item.system.nextLevel}]`) : null,
        });

        return context;
    }
}
