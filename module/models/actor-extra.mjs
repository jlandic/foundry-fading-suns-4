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
            maneuvers: new TypedObjectField(new SchemaField({
                name: new StringField({ required: true }),
                goal: new NumberField({ required: true }),
                impact: new StringField({ required: true }),
            })),
        }, { recursive: false });
    }

    get maxVitality() {
        return this.size + 5;
    }
}
