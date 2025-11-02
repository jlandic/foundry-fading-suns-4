import { DamageTypes, WeaponTypes } from "../system/references.mjs";
import EquipmentDataModel from "./item-equipment.mjs";

const {
    BooleanField,
    NumberField,
    StringField,
    ArrayField,
    SchemaField,
} = foundry.data.fields;

export default class WeaponDataModel extends EquipmentDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            capability: new StringField({ required: false }),
            damage: new NumberField({ required: true }),
            strRequirement: new NumberField({ required: true, initial: 0 }),
            melee: new BooleanField({ required: true, initial: true }),
            range: new SchemaField({
                extreme: new BooleanField({ required: true, initial: false }),
                short: new NumberField({ required: false }),
                long: new NumberField({ required: false }),
            }),
            rof: new NumberField({ required: false, initial: 1 }),
            burst: new BooleanField({ required: true, initial: false }),
            ammo: new NumberField({ required: true, initial: 0 }),
            currentAmmo: new NumberField({ required: true, initial: 0 }),
            anti: new ArrayField(new StringField({
                required: true,
                choices: Object.values(DamageTypes),
            })),
            features: new ArrayField(new StringField({ required: true })),
            blastForce: new NumberField({
                required: false,
            })
        });
    }

    get extremeRange() {
        if (this.range.melee || !this.range.extremeRange) return null;

        return this.range.long * 2;
    }

    get type() {
        return this.melee ? WeaponTypes.Melee : WeaponTypes.Ranged;
    }

    get rangeText() {
        if (this.melee) return "fs4.weapons.fields.melee";

        if (this.range.extreme) {
            return `${this.range.short}/${this.range.long}/${this.extremeRange}`;
        }

        return `${this.range.short}/${this.range.long}`;
    }

    resetRange() {
        this.range.short = undefined;
        this.range.long = undefined;
        this.range.extreme = false;
    }
}
