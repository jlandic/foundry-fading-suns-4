import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    StringField,
} = foundry.data.fields;

export default class FactionDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            perk: new StringField({ required: true }),
            blessing: new StringField({ required: true }),
            curse: new StringField({ required: true }),
            equipment: new StringField({ required: true }),
            characteristics: customFields.characteristics(),
            skills: customFields.skills(),
            favoredCalling: new StringField({ required: true }),
        });
    }
}
