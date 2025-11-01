import { PerkSourceTypes, PerkTypes, PreconditionTypes } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    HTMLField,
    StringField,
} = foundry.data.fields;

export default class PerkDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            sourceType: new StringField({ required: true, choices: Object.values(PerkSourceTypes), initial: Object.values(PerkSourceTypes)[0] }),
            type: new StringField({ required: true, choices: Object.values(PerkTypes), initial: Object.values(PerkTypes)[0] }),
            benefice: new HTMLField({ required: true }),
            preconditions: customFields.preconditions(),
            cyberdevice: new StringField({ required: false }),
            nextLevel: new StringField({ required: false }),
            previousLevel: new StringField({ required: false }),
        });
    }

    get isOpen() {
        return !this.preconditions.some((group) => [PreconditionTypes.Class, PreconditionTypes.Calling].includes(group[0]?.type));
    }
}
