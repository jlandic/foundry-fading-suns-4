import { ActionTypes, Characteristics, None, PlayScales, PowerDisciplines, Skills } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";
import * as customFields from "./custom-fields.mjs";

const {
    ArrayField,
    BooleanField,
    HTMLField,
    NumberField,
    StringField,
    SchemaField,
} = foundry.data.fields;

export default class PowerDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            cost: new NumberField({ required: true, initial: 0, min: 0 }),
            additionalCost: new StringField({ required: false }),
            path: new StringField({ required: true }),
            characteristic: new StringField({
                required: true,
                choices: Object.values(Characteristics),
                initial: Object.values(Characteristics)[0]
            }),
            skill: new StringField({
                required: true,
                choices: Object.values(Skills),
                initial: Object.values(Skills)[0]
            }),
            discipline: new StringField({
                required: true,
                choices: Object.values(PowerDisciplines),
                initial: PowerDisciplines.Psi,
            }),
            components: new SchemaField({
                liturgy: new BooleanField({ required: false, initial: false }),
                gestures: new BooleanField({ required: false, initial: false }),
                prayer: new BooleanField({ required: false, initial: false }),
            }),
            level: new NumberField({ required: true, initial: 1, min: 1 }),
            preconditions: customFields.preconditions(),
            elemental: new BooleanField({ required: true, initial: false }),
            resistance: new HTMLField({ required: true, initial: "" }),
            impact: new HTMLField({ required: true }),
            playScale: new StringField({ required: true, choices: Object.values(PlayScales), initial: PlayScales.Instantaneous }),
            actionType: new ArrayField(new StringField({
                required: true,
                choices: [
                    ...Object.values(ActionTypes),
                    None,
                ],
            })),
        });
    }

    get canRequireComponents() {
        return this.discipline === PowerDisciplines.Theurgy;
    }
}
