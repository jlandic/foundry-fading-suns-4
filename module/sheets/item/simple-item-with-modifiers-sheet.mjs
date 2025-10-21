import BaseItemSheet from "./base-item-sheet.mjs";

export default class SimpleItemWithModifiers extends BaseItemSheet {
    static TABS = {
        primary: {
            initial: "main",
            tabs: [
                this.TAB_REFERENCES.main,
                this.TAB_REFERENCES.modifiers,
            ]
        }
    };

    get typePart() {
        return "simpleItem";
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
        });

        return context;
    }
}
