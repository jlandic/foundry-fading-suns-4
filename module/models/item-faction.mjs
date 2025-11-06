import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    ArrayField,
    SchemaField,
    StringField,
} = foundry.data.fields;

export default class FactionDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            perk: new StringField({ required: true }),
            blessing: new ArrayField(new StringField({ required: true })),
            curse: new StringField({ required: true }),
            equipment: new ArrayField(new ArrayField(new SchemaField({
                type: new StringField({ required: true }),
                slug: new StringField({ required: true }),
            }))),
            characteristics: customFields.characteristics(),
            skills: customFields.skills(),
            favoredCalling: new StringField({ required: true }),
            capabilities: customFields.capabilities(),
        });
    }
}
