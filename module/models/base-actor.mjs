import * as rules from "../system/rules/_module.mjs";

const {
    HTMLField,
    NumberField,
    SchemaField,
    StringField,
} = foundry.data.fields;

export default class BaseActorDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            species: new StringField({ nullable: true }),
            size: new NumberField({ required: true, initial: 5 }),
            speed: new SchemaField({
                twoLegs: new NumberField({ required: true, initial: 10 }),
                fourLegs: new NumberField({ nullable: true, initial: null }),
                sixLegs: new NumberField({ nullable: true, initial: null }),
            }),
            description: new HTMLField({
                required: true,
            }),
            currentVitality: new NumberField({ required: true, initial: 0 }),
            gmNotes: new HTMLField({ required: true }),
            vp: new SchemaField({
                cache: new NumberField({ required: true, initial: 0 }),
            }),
        };
    }

    get hasVPBank() {
        return this.vp?.bank !== undefined;
    }

    get hasWP() {
        return this.wp !== undefined;
    }

    get hasRevivals() {
        return this.revivals !== undefined;
    }

    get hasSurges() {
        return this.surges !== undefined;
    }

    get vitality() {
        return {
            value: this.currentVitality,
            max: this.maxVitality,
        };
    }

    get maxRevivals() {
        if (!this.hasRevivals || !this.level) return undefined;

        return rules.surgeAndRevivalAmountForLevel(this.level);
    }

    get maxSurges() {
        if (!this.hasSurges || !this.level) return undefined;

        return rules.surgeAndRevivalAmountForLevel(this.level);
    }

    get maxBank() {
        if (!this.hasVPBank || !this.level) return undefined;

        return rules.bankCapacityForLevel(this.level);
    }

    get bankVPCapacity() {
        if (this.maxBank) {
            if (this.hasWP) {
                return this.maxBank - this.wp;
            }

            return this.maxBank;
        }

        return undefined;
    }

    get revivalVitalityGain() {
        if (!this.hasRevivals || !this.level) return undefined;

        return this.size + this.level;
    }

    get surgeVPGain() {
        if (!this.hasSurges || !this.level || !this.characteristics) return undefined;

        return (
            Math.max(
                this.characteristics.strength,
                this.characteristics.wits,
                this.characteristics.presence,
            ) + this.level
        );
    }
}
