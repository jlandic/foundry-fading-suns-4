import AgentDataModel from "./actor-agent.mjs";

const {
    NumberField,
    SchemaField,
} = foundry.data.fields;

export default class HeadlinerDataModel extends AgentDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            vp: new SchemaField({
                cache: new NumberField({ required: true, initial: 0 }),
                bank: new NumberField({ required: true, initial: 0 }),
            }),
            wp: new NumberField({ required: true, initial: 0 }),
        }, { recursive: false });
    }

    get maxVitality() {
        return (
            this.size +
            this.level +
            this.characteristics.endurance +
            this.characteristics.will +
            this.characteristics.faith
        );
    }
}
