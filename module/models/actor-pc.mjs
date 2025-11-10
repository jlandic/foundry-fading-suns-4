import HeadlinerDataModel from "./actor-headliner.mjs";

const {
    NumberField,
    HTMLField,
} = foundry.data.fields;

export default class PCDataModel extends HeadlinerDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            savings: new NumberField({ required: true, initial: 0 }),
            notes: new HTMLField({ required: true }),
        }, { recursive: false });
    }
}
