import { ManeuverGoalModifiers, ManeuverTypes, ModifierContexts, ModifierTargetTypes, ModifierValueTypes } from "../system/references.mjs";

export default class BaseActiveEffect extends foundry.documents.ActiveEffect {
    get valueAsNumber() {
        return Number(this.system.value);
    }

    get humanReadable() {
        if (this.system.valueType === ModifierValueTypes.Favorable) {
            return game.i18n.localize("fs4.modifier.valueTypes.favorable");
        }

        if (this.system.valueType === ModifierValueTypes.Unfavorable) {
            return game.i18n.localize("fs4.modifier.valueTypes.unfavorable");
        }

        if (this.system.targetType === ModifierTargetTypes.Goal) {
            return `${this.system.value >= 0 ? "+" : ""}${this.system.value}`;
        }

        if (this.system.targetType === ModifierTargetTypes.None) {
            return game.i18n.localize(`fs4.modifier.valueTypes.${this.system.valueType}`);
        }

        const targetName = game.i18n.localize(`${this.targetI18nPrefix}.${this.system.target}`);

        return `${targetName} ${this.system.value >= 0 ? "+" : ""}${this.system.value}`;
    }

    get maneuverName() {
        if (!this.system.maneuverSlug) return null;

        const maneuver = globalThis.registry.fromSlugSync(this.system.maneuverSlug, "maneuver");
        return maneuver ? maneuver.name : null;
    }

    get targetI18nPrefix() {
        switch (this.system.targetType) {
            case ModifierTargetTypes.Characteristic:
                return "fs4.characteristics";
            case ModifierTargetTypes.Skill:
                return "fs4.skills";
            case ModifierTargetTypes.Resistance:
                return "fs4.resistances";
            default:
                return "fs4.modifier.noAffectedAttribute";
        }
    }

    appliesToRoll(rollIntention) {
        if (
            [
                ModifierTargetTypes.Resistance,
                ModifierTargetTypes.Initiative,
                ModifierTargetTypes.Damage,
            ].includes(this.system.targetType)
        ) return false;

        if (this.system.targetType === ModifierTargetTypes.Characteristic && this.system.target !== rollIntention.characteristic) {
            return false;
        }

        if (this.system.targetType === ModifierTargetTypes.Skill && this.system.target !== rollIntention.skill) {
            return false;
        }

        if (this.system.context === ModifierContexts.None) {
            return true;
        }

        if (!rollIntention.maneuver) {
            return true;
        }

        switch (this.system.context) {
            case ModifierContexts.MeleeAttack:
                return rollIntention.maneuver.system.goalModifier === ManeuverGoalModifiers.MeleeWeapon;
            case ModifierContexts.RangedAttack:
                return rollIntention.maneuver.system.goalModifier === ManeuverGoalModifiers.RangedWeapon;
            case ModifierContexts.Influence:
                return [
                    ManeuverTypes.InfluencePersuasion,
                    ManeuverTypes.InfluenceCoercion,
                    ManeuverTypes.Influence,
                ].includes(rollIntention.maneuver.system.type);
            case ModifierContexts.InfluencePersuasion:
                return rollIntention.maneuver.system.type === ManeuverTypes.InfluencePersuasion;
            case ModifierContexts.InfluenceCoercion:
                return rollIntention.maneuver.system.type === ManeuverTypes.InfluenceCoercion;
            case ModifierContexts.Defense:
                return rollIntention.maneuver.system.type === ManeuverTypes.Defense;
            case ModifierContexts.SpecificManeuver:
                return this.system.maneuverSlug === rollIntention.maneuver.system.slug;
            default:
                return false;
        }
    }
}
