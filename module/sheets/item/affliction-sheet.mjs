import BaseItemSheet from "./base-item-sheet.mjs";

export default class AfflictionSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            preconditions: await this._preparePreconditions(),
        });

        return context;
    }
}
