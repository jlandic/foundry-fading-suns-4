import { Characteristics, INITIAL_CHARACTERISTIC_VALUE, INITIAL_RESERVED_SKILL_VALUE, INITIAL_SKILL_VALUE, RESERVED_SKILLS, Skills } from "../system/references.mjs";
import BaseActorDataModel from "./base-actor.mjs";

const {
    NumberField,
    SchemaField,
    StringField,
} = foundry.data.fields;

export default class AgentDataModel extends BaseActorDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            level: new NumberField({ required: true, initial: 1 }),
            rank: new StringField({ required: true }),
            class: new StringField({ nullable: true }),
            faction: new StringField({ nullable: true }),
            calling: new StringField({ nullable: true }),
            secondaryCalling: new StringField({ nullable: true }),
            tertiaryCalling: new StringField({ nullable: true }),
            planet: new StringField({ required: true }),
            birthdate: new StringField({ required: true }),
            blessing: new StringField({ nullable: true }),
            curse: new StringField({ nullable: true }),
            affliction: new StringField({ nullable: true }),
            characteristics: new SchemaField(Object.values(Characteristics).reduce((acc, characteristic) => {
                acc[characteristic] = new NumberField({ required: true, initial: INITIAL_CHARACTERISTIC_VALUE });
                return acc;
            }, {})),
            skills: new SchemaField(Object.values(Skills).reduce((acc, skill) => {
                const initial = RESERVED_SKILLS.includes(skill) ? INITIAL_RESERVED_SKILL_VALUE : INITIAL_SKILL_VALUE;
                acc[skill] = new NumberField({ required: true, initial });
                return acc;
            }, {})),
            occult: new SchemaField({
                psi: new NumberField({ required: true, initial: 0 }),
                urge: new NumberField({ required: true, initial: 0 }),
                theurgy: new NumberField({ required: true, initial: 0 }),
                hubris: new NumberField({ required: true, initial: 0 }),
            }),
            surges: new NumberField({ required: true, initial: 0 }),
        }, { recursive: false });
    }

    get maxVitality() {
        return (
            this.size +
            this.level +
            5
        );
    }
}
