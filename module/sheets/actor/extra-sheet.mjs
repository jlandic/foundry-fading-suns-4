import BaseActorSheet from "./base-actor-sheet.mjs";

export default class ExtraSheet extends BaseActorSheet {
    static TABS = {
        primary: {
            tabs: [
                BaseActorSheet.TAB_REFERENCES.statsExtra,
                BaseActorSheet.TAB_REFERENCES.equipment,
                BaseActorSheet.TAB_REFERENCES.gmNotes,
            ],
            initial: "statsExtra",
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {});

        return context;
    }
}
