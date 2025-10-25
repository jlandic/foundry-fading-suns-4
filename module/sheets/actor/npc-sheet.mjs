import BaseActorSheet from "./base-actor-sheet.mjs";

export default class NPCSheet extends BaseActorSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
        });

        return context;
    }
}
