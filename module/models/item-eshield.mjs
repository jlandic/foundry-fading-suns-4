import { EShieldTypes } from "../system/references.mjs";
import EquipmentDataModel from "./item-equipment.mjs";

const {
    NumberField,
    StringField,
    ArrayField,
    SchemaField,
    BooleanField,
} = foundry.data.fields;

export default class EShieldDataModel extends EquipmentDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            compatibility: new StringField({
                required: true,
                choices: Object.values(EShieldTypes),
                initial: EShieldTypes.Es,
            }),
            thresholds: new SchemaField({
                low: new NumberField({ required: true, initial: 5 }),
                high: new NumberField({ required: true, initial: 10 }),
            }),
            features: new ArrayField(new StringField({ required: true })),
            hits: new NumberField({ required: true, initial: 0 }),
            burnout: new NumberField({ required: true, initial: 0 }),
            distortion: new NumberField({ required: true, initial: 0 }),
            state: new SchemaField({
                hits: new NumberField({ required: true, initial: 0 }),
                burnoutRounds: new NumberField({ required: true, initial: 0 }),
                isDistorted: new BooleanField({ required: true, initial: false }),
            }),
        });
    }

    get hitsText() {
        return `${this.state.hits}/${this.hits}`;
    }

    get burnoutText() {
        return `${this.state.burnoutRounds}/${this.burnout}`;
    }
}
