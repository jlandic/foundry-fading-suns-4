import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseActorSheet from "./base-actor-sheet.mjs";

export default class PCSheet extends BaseActorSheet {
    static TABS = {
        primary: {
            tabs: [
                BaseActorSheet.TAB_REFERENCES.stats,
                BaseActorSheet.TAB_REFERENCES.features,
                BaseActorSheet.TAB_REFERENCES.maneuvers,
                BaseActorSheet.TAB_REFERENCES.inventory,
                BaseActorSheet.TAB_REFERENCES.modifiers,
                BaseActorSheet.TAB_REFERENCES.notes,
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
