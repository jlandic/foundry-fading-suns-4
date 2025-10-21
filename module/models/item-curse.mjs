import BaseItemDataModel from "./base-item.mjs";

export default class CurseDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
        });
    }
}
