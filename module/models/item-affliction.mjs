import BaseItem from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

export default class AfflictionDataModel extends BaseItem {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            preconditions: customFields.preconditions(),
        });
    }
}
