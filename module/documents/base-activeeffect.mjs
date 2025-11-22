import { ManeuverGoalModifiers, ManeuverTypes, ModifierContexts, ModifierTargetTypes, ModifierValueTypes } from "../system/references.mjs";

export default class BaseActiveEffect extends foundry.documents.ActiveEffect {
    get valueAsNumber() {
        return Number(this.system.value);
    }

    get humanReadable() {
        let context = "";

        switch (this.system.context) {
            case ModifierContexts.MeleeAttack:
            case ModifierContexts.RangedAttack:
            case ModifierContexts.Influence:
            case ModifierContexts.InfluencePersuasion:
            case ModifierContexts.InfluenceCoercion:
            case ModifierContexts.Defense:
                context = `${game.i18n.localize("fs4.modifier.contexts." + this.system.context)}: `;
                break;
            case ModifierContexts.SpecificManeuver:
                if (this.maneuverName) {
                    context = `${this.maneuverName}: `;
                }
                break;
        }

        if (this.system.valueType === ModifierValueTypes.Favorable) {
            return context + game.i18n.localize("fs4.modifier.valueTypes.favorable");
        }

        if (this.system.valueType === ModifierValueTypes.Unfavorable) {
            return context + game.i18n.localize("fs4.modifier.valueTypes.unfavorable");
        }

        if (this.system.targetType === ModifierTargetTypes.Goal) {
            return `${context}${this.system.value >= 0 ? "+" : ""}${this.system.value}`;
        }

        if (this.system.targetType === ModifierTargetTypes.None) {
            return context + game.i18n.localize(`fs4.modifier.valueTypes.${this.system.valueType}`);
        }

        const targetName = game.i18n.localize(`${this.targetI18nPrefix}.${this.system.target}`);

        return `${context}${targetName} ${this.system.value >= 0 ? "+" : ""}${this.system.value}`;
    }

    get maneuverName() {
        if (!this.system.maneuverSlug) return null;

        const maneuver = globalThis.fs4.registry.fromSlug(this.system.maneuverSlug, "maneuver");
        return maneuver ? maneuver.name : null;
    }

    get targetI18nPrefix() {
        switch (this.system.targetType) {
            case ModifierTargetTypes.Characteristic:
                return "fs4.characteristics";
            case ModifierTargetTypes.Skill:
                return "fs4.skills";
            case ModifierTargetTypes.Resistance:
                return "fs4.resistance";
            case ModifierTargetTypes.Initiative:
                return "fs4.modifier.initiativeModifierTypes";
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
            return this.system.context === ModifierContexts.None;
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
