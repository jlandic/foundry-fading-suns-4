import { ResistanceTypes } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";

const {
    StringField,
} = foundry.data.fields;

export default class StateDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            type: new StringField({
                required: true,
                choices: Object.values(ResistanceTypes),
                initial: ResistanceTypes.Body,
            }),
        });
    }
}
