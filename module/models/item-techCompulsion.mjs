import BaseItemDataModel from "./base-item.mjs";

export default class TechCompulsionDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
        });
    }
}
