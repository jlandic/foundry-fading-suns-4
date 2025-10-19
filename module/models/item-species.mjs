import BaseItem from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    ArrayField,
    NumberField,
    SchemaField,
    StringField,
} = foundry.data.fields;

export default class SpeciesDataModel extends BaseItem {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            size: new NumberField({ required: true, initial: 5 }),
            speed: new SchemaField({
                twoLegs: new NumberField({ required: true, initial: 10 }),
                fourLegs: new NumberField({ required: false }),
                sixLegs: new NumberField({ required: false }),
            }),
            birthrights: new ArrayField(new StringField({ required: true })),
            perks: new ArrayField(new StringField({ required: true })),
            conditionedPerks: new ArrayField(new StringField({ required: true })),
            capabilities: new ArrayField(new StringField({ required: true })),
            powerSkills: customFields.powerSkills(),
            maneuvers: new ArrayField(new StringField({ required: true })),
        });
    }
}
