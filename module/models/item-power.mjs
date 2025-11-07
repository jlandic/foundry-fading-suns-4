import { Characteristics, PowerDisciplines, Skills } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "../system/custom-fields.mjs";

const {
    ArrayField,
    BooleanField,
    NumberField,
    StringField,
    SchemaField,
} = foundry.data.fields;

export default class PowerDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            cost: new NumberField({ required: true, initial: 0, min: 0 }),
            additionalCost: new StringField({ required: false }),
            path: new StringField({ required: true }),
            characteristics: new StringField({ required: true, choices: Object.values(Characteristics) }),
            skill: new StringField({ required: true, choices: Object.values(Skills) }),
            discipline: new StringField({
                required: true,
                choices: Object.values(PowerDisciplines),
                initial: PowerDisciplines.Psi,
            }),
            components: new ArrayField(new SchemaField({
                liturgy: new BooleanField({ required: false, initial: false }),
                gestures: new BooleanField({ required: false, initial: false }),
                prayer: new BooleanField({ required: false, initial: false }),
            })),
            level: new NumberField({ required: true, initial: 1, min: 1 }),
            preconditions: customFields.preconditions(),
            elementary: new BooleanField({ required: true, initial: false }),
        });
    }

    get canRequiredComponents() {
        return this.discipline === PowerDisciplines.Theurgy;
    }
}
