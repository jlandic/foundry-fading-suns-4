import BaseItem from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    ArrayField,
    StringField
} = foundry.data.fields;

export default class ClassDataModel extends BaseItem {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            characteristics: customFields.characteristics(),
            skills: customFields.skills(),
            perk: new StringField({ required: true }),
            perks: new ArrayField(new StringField({ required: true })),
            capabilities: new ArrayField(new StringField({ required: true })),
        });
    }
}
