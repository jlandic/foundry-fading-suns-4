import { EquipmentCostMultipliers, EquipmentQualities, EquipmentSizes } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";

const {
    BooleanField,
    NumberField,
    StringField,
} = foundry.data.fields;

export default class PhysicalItemDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            tl: new NumberField({ required: false }),
            curio: new BooleanField({ required: false, initial: false }),
            agora: new StringField({ required: true, initial: "" }),
            fb: new NumberField({ required: false }),
            quantity: new NumberField({ required: true, initial: 1 }),
            techCompulsion: new StringField({ required: false }),
            quality: new StringField({
                required: true,
                choices: Object.values(EquipmentQualities),
                initial: EquipmentQualities.Standard,
            }),
            size: new StringField({
                required: true,
                choices: Object.values(EquipmentSizes),
                initial: EquipmentSizes.None,
            }),
        });
    }

    get adjustedCost() {
        if (this.fb == null) return null;

        return Math.round(this.fb * EquipmentCostMultipliers[this.quality]);
    }

    get isEquippable() {
        return true;
    }
}
