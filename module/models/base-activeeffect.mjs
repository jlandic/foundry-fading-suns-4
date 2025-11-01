import { ModifierContexts, ModifierTargetTypes, ModifierValueTypes } from "../system/references.mjs";

const {
    BooleanField,
    StringField,
} = foundry.data.fields;

export default class BaseActiveEffectDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            value: new StringField({ required: false }),
            valueType: new StringField({
                required: true,
                choices: Object.values(ModifierValueTypes),
                initial: ModifierValueTypes.Constant,
            }),
            targetType: new StringField({
                required: true,
                choices: Object.values(ModifierTargetTypes),
                initial: ModifierTargetTypes.Goal,
            }),
            target: new StringField({
                required: false,
            }),
            austerity: new BooleanField({ required: true, initial: false }),
            context: new StringField({
                required: true,
                choices: Object.values(ModifierContexts),
                initial: ModifierContexts.None,
            }),
            maneuverSlug: new StringField({ required: false }),
            notes: new StringField({ required: false }),
        };
    }

    get valueAsNumber() {
        return Number(this.value);
    }

    get targetI18nPrefix() {
        switch (this.targetType) {
            case ModifierTargetTypes.Characteristic:
                return "fs4.characteristics.";
            case ModifierTargetTypes.Skill:
                return "fs4.skills.";
            case ModifierTargetTypes.Resistance:
                return "fs4.resistance.";
            default:
                return "fs4.common.none";
        }
    }

    get contextManeuverName() {
        if (!this.maneuverId) return null;

        return globalThis.registry.fromSlug(this.maneuverSlug, "maneuver")?.name;
    }
}
