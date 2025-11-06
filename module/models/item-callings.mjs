import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    ArrayField,
    HTMLField,
    StringField,
    SchemaField,
} = foundry.data.fields;

export default class CallingDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            capabilities: customFields.capabilities(),
            perks: new ArrayField(new StringField({
                required: true,
            })),
            patrons: new HTMLField(),
            characteristics: customFields.characteristics(),
            skills: customFields.skills(),
            preconditions: customFields.preconditions(),
            equipment: new ArrayField(new ArrayField(new SchemaField({
                type: new StringField({ required: true }),
                slug: new StringField({ required: true }),
            }))),
        });
    }

    get isOpen() {
        return this.preconditions.length === 0;
    }

    isRestrictedToClass(classSlug) {
        return this.preconditions.some(precondition => precondition.some(condition => condition.type === "class" && condition.value === classSlug));
    }
}
