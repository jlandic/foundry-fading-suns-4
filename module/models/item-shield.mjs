import EquipmentDataModel from "./item-equipment.mjs";

const {
    NumberField,
    StringField,
    ArrayField,
} = foundry.data.fields;

export default class ShieldDataModel extends EquipmentDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            res: new NumberField({ required: true, initial: 0 }),
            damage: new NumberField({ required: true, initial: 0 }),
            strRequirement: new NumberField({ required: true, initial: 0 }),
            features: new ArrayField(new StringField({ required: true })),
        });
    }
}
