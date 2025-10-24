import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";

export default class PCSheet extends BaseActorSheet {
    static TABS = {
        primary: {
            tabs: [
                BaseActorSheet.TAB_REFERENCES.stats,
                BaseActorSheet.TAB_REFERENCES.features,
                BaseActorSheet.TAB_REFERENCES.modifiers,
                BaseActorSheet.TAB_REFERENCES.equipment,
                BaseActorSheet.TAB_REFERENCES.notes,
                BaseActorSheet.TAB_REFERENCES.gmNotes,
            ].filter(Boolean),
            initial: "stats",
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
            notes: await enrichHTML(this.actor.system.notes),
        });

        return context;
    }
}
