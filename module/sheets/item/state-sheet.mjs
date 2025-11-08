import { ResistanceTypes } from "../../system/references.mjs";
import SimpleItemWithModifiers from "./simple-item-with-modifiers-sheet.mjs";

export default class StateSheet extends SimpleItemWithModifiers {
    get typePart() {
        return "state";
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            typeOptions: this._prepareSelectOptions(
                Object.values(ResistanceTypes),
                this.item.system.type,
                "fs4.resistance",
            ),
        });

        return context;
    }
}
