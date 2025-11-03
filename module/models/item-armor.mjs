import { DamageTypes, EShieldTypes, WeaponTypes } from "../system/references.mjs";
import EquipmentDataModel from "./item-equipment.mjs";

const {
    NumberField,
    StringField,
    ArrayField,
} = foundry.data.fields;

export default class ArmorDataModel extends EquipmentDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            capability: new StringField({ required: false }),
            res: new NumberField({ required: true }),
            eshieldCompatibility: new StringField({
                required: true,
                choices: Object.values(EShieldTypes),
                initial: EShieldTypes.Es,
            }),
            anti: new ArrayField(new StringField({
                required: true,
                choices: Object.values(DamageTypes),
            })),
            features: new ArrayField(new StringField({ required: true })),
        });
    }
}
