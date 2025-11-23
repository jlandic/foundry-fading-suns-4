import BaseActorDataModel from "./base-actor.mjs";

const {
    NumberField,
    SchemaField,
    StringField,
    TypedObjectField,
} = foundry.data.fields;

export default class ExtraDataModel extends BaseActorDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            vp: new SchemaField({
                cache: new NumberField({ required: true, initial: 0 }),
            }),
            maneuvers: new TypedObjectField(new SchemaField({
                name: new StringField({ required: true }),
                goal: new NumberField({ required: true }),
                impact: new StringField({ required: true }),
            })),
            resistance: new SchemaField({
                body: new NumberField({ required: true, initial: 0 }),
                mind: new NumberField({ required: true, initial: 0 }),
                spirit: new NumberField({ required: true, initial: 0 }),
            }),
        }, { recursive: false });
    }

    get maxVitality() {
        return this.size + 5;
    }
}
