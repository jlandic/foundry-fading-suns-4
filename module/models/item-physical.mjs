import { EquipmentCostMultipliers, EquipmentQualities } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";

const {
    BooleanField,
    NumberField,
    StringField,
} = foundry.data.fields;

export default class PhysicalItemDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            nt: new NumberField({ required: false }),
            curio: new BooleanField({ required: false, initial: false }),
            agora: new StringField({ required: true, initial: "" }),
            cost: new NumberField({ required: false }),
            techCompulsion: new StringField({ required: false }),
            quality: new StringField({
                required: true,
                choices: Object.values(EquipmentQualities),
                initial: EquipmentQualities.Standard,
            }),
        });
    }

    get adjustedCost() {
        if (this.cost == null) return null;

        return Math.round(this.cost * EquipmentCostMultipliers[this.quality]);
    }

    get goalModifier() {
        if (this.quality !== EquipmentQualities.Premium) return 0;

        return 1;
    }
}
