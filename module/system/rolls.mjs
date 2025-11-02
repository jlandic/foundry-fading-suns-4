import { ModifierTargetTypes, ModifierValueTypes, RollFavor } from "./references.mjs";

export const RollTypes = Object.freeze({
    Skill: "skill",
    Maneuver: "maneuver",
});

export class RollIntention {
    constructor({
        characteristic = null,
        skill = null,
        maneuver = null,
    } = {}) {
        this.maneuver = maneuver;

        if (this.maneuver) {
            this.characteristic = this.maneuver.system.characteristic;
            this.skill = this.maneuver.system.skill;
        } else {
            this.characteristic = characteristic;
            this.skill = skill;
        }
    }

    toString() {
        if (this.maneuver) {
            return this.maneuver.name;
        }

        return `${this.skillLabel} + ${this.characteristicLabel}`;
    }

    get characteristicLabel() {
        return game.i18n.localize(`fs4.characteristics.${this.characteristic}`)
    }

    get skillLabel() {
        return game.i18n.localize(`fs4.skills.${this.skill}`);
    }
}

export class RollData {
    constructor({
        actor = null,
        goalModifier = 0,
        favor = RollFavor.Normal,
        rollIntention = new RollIntention(),
        modifiers = [],
    } = {}) {
        this.actor = actor;
        this.goalModifier = goalModifier;
        this.favor = favor;
        this.rollIntention = rollIntention;
        this.modifiers = modifiers;
    }

    get characteristicActorValue() {
        if (this.actor.type === "extra") return null;

        return this.actor.system.characteristics[this.rollIntention.characteristic];
    }

    get skillActorValue() {
        if (this.actor.type === "extra") return null;

        return this.actor.system.skills[this.rollIntention.skill];
    }

    get baseGoal() {
        if (this.actor.type === "extra") {
            return this.rollIntention.maneuver.goal;
        }

        return this.modifiedCharacteristicValue + this.modifiedSkillValue;
    }

    get characteristicModifier() {
        const characteristicModifiers = this.modifiers.filter((modifier) => {
            return modifier.system.targetType === ModifierTargetTypes.Characteristic &&
                modifier.system.target === this.rollIntention.characteristic;
        });

        return characteristicModifiers.reduce((sum, modifier) => sum + modifier.valueAsNumber, 0);
    }

    get skillModifier() {
        const skillModifiers = this.modifiers.filter((modifier) => {
            return modifier.system.targetType === ModifierTargetTypes.Skill &&
                modifier.system.target === this.rollIntention.skill;
        });

        return skillModifiers.reduce((sum, modifier) => sum + modifier.valueAsNumber, 0);
    }

    get modifiedCharacteristicValue() {
        if (!this.characteristicActorValue) return 0;

        return this.characteristicActorValue + this.characteristicModifier;
    }

    get modifiedSkillValue() {
        if (!this.skillActorValue) return 0;

        return this.skillActorValue + this.skillModifier;
    }

    get modifiedGoal() {
        const goalModifiers = this.modifiers.filter((modifier) => {
            return modifier.system.targetType === ModifierTargetTypes.Goal;
        });

        return goalModifiers.reduce((sum, modifier) => sum + modifier.valueAsNumber, 0);
    }

    get finalGoal() {
        return this.baseGoal + this.goalModifier + this.modifiedGoal;
    }

    get hasAtLeastOneFavor() {
        return this.favor === RollFavor.Favorable ||
            this.modifiers.some((modifier) => modifier.system.valueType === ModifierValueTypes.Favorable);
    }

    get hasAtLeastOneUnfavor() {
        return this.favor === RollFavor.Unfavorable ||
            this.modifiers.some((modifier) => modifier.system.valueType === ModifierValueTypes.Unfavorable);
    }

    get isFavorable() {
        return this.hasAtLeastOneFavor && !this.hasAtLeastOneUnfavor;
    }

    get isUnfavorable() {
        return this.hasAtLeastOneUnfavor && !this.hasAtLeastOneFavor;
    }
}

export class DiceThrow {
    constructor(rollData) {
        this.rollData = rollData;
        this.result = null;
        this.rolls = [];
    }

    static isBetterThan(a, b) {
        if (a.vp === b.vp) {
            return a.result < b.result;
        }

        return a.vp > b.vp;
    }

    static calculateVP(result, goal) {
        let vp = result;

        if (vp > goal) {
            return 0;
        }

        if (vp === 19 || vp === 20) {
            return 0;
        }

        return vp;
    }

    async roll() {
        let rolls = [];

        const roll = await new Roll("1d20").roll();
        this.rolls.push(roll);

        if (game.dice3d) {
            await game.dice3d.showForRoll(roll, game.user, true);
        }

        this.result = roll.total;

        if (this.isFavorable || this.isUnfavorable) {
            const secondRoll = await new Roll("1d20").roll();
            this.rolls.push(secondRoll);

            if (game.dice3d) {
                await game.dice3d.showForRoll(secondRoll, game.user, true);
            }

            const firstRollResult = { result: roll.total, goal: this.goal };
            const secondRollResult = { result: secondRoll.total, goal: this.goal };

            if (this.isFavorable && DiceThrow.isBetterThan(secondRollResult, firstRollResult)) {
                this.result = secondRoll.total;
            } else if (this.isUnfavorable && DiceThrow.isBetterThan(firstRollResult, secondRollResult)) {
                this.result = secondRoll.total;
            }
        }

        return this;
    }

    get vp() {
        if (this.result === null) return null;

        return DiceThrow.calculateVP(this.result, this.goal);
    }

    get goal() {
        return this.rollData.finalGoal;
    }

    get isFavorable() {
        return this.rollData.isFavorable;
    }

    get isUnfavorable() {
        return this.rollData.isUnfavorable;
    }

    get isCriticalSuccess() {
        return this.vp === this.goal;
    }

    get isCriticalFailure() {
        return this.result === 20;
    }

    get chatContext() {
        return {
            result: this.result,
            vp: this.vp,
            hasVpToGain: this.vp > 0,
            goal: this.goal,
            isFavorable: this.isFavorable,
            isUnfavorable: this.isUnfavorable,
            isCriticalSuccess: this.isCriticalSuccess,
            isCriticalFailure: this.isCriticalFailure,
            maneuverUuid: this.rollData.rollIntention.maneuver?.uuid,
            maneuverName: this.rollData.rollIntention.maneuver?.name,
            characteristic: this.rollData.rollIntention.characteristicLabel,
            skill: this.rollData.rollIntention.skillLabel,
            characteristicActorValue: this.rollData.characteristicActorValue,
            skillActorValue: this.rollData.skillActorValue,
            modifiedCharacteristicValue: this.rollData.modifiedCharacteristicValue,
            modifiedSkillValue: this.rollData.modifiedSkillValue,
            characteristicModifier: this.rollData.characteristicModifier,
            skillModifier: this.rollData.skillModifier,
            baseGoal: this.rollData.baseGoal,
            goalModifier: this.rollData.goalModifier,
            modifiedGoal: this.rollData.modifiedGoal,
            modifiers: this.rollData.modifiers,
            hasModifiers: this.rollData.modifiers.length > 0,
            actorId: this.rollData.actor.id,
            isExtra: this.rollData.actor.type === "extra",
            // TODO: check whether Actor is overloaded
            techCompulsionRisk: this.isCriticalSuccess,
        }
    }

    async sendToChat() {
        ChatMessage.create(
            {
                speaker: ChatMessage.getSpeaker({ actor: this.rollData.actor }),
                content: await renderTemplate(
                    "systems/fading-suns-4/templates/chat/roll-result.hbs",
                    this.chatContext,
                ),
            },
            {
                rollMode: game.settings.get("core", "rollMode"),
            },
        );
    }
}
