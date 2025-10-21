import { CapabilityCategories, CapabilityTypes } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    StringField,
} = foundry.data.fields;

export default class CapabilityDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            type: new StringField({
                required: true,
                choices: Object.values(CapabilityTypes),
                initial: Object.values(CapabilityTypes)[0],
            }),
            category: new StringField({
                required: true,
                choices: Object.values(CapabilityCategories),
                initial: Object.values(CapabilityCategories)[0],
            }),
            preconditions: customFields.preconditions(),
        });
    }
}
