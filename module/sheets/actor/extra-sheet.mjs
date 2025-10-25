import BaseActorSheet from "./base-actor-sheet.mjs";

export default class ExtraSheet extends BaseActorSheet {
    static TABS = {
        primary: {
            tabs: [
                BaseActorSheet.TAB_REFERENCES.statsExtra,
                BaseActorSheet.TAB_REFERENCES.inventory,
                BaseActorSheet.TAB_REFERENCES.gmNotes,
            ],
            initial: "statsExtra",
        }
    };

    get droppableAsReferences() {
        return [
            "species",
        ];
    }

    get droppableAsEmbedded() {
        return [
            "inventory",
            "maneuver",
            "state",
            "capability",
            "perk",
            "weapon",
            "armor",
            "handshield",
            "eshield",
            "power",
        ];
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
        });

        return context;
    }
}
