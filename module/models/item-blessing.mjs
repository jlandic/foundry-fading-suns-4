import BaseItemDataModel from "./base-item.mjs";

export default class BlessingDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
        });
    }
}
