import { ActionTypes, Characteristics, ManeuverGoalModifiers, ManeuverTypes, None, PlayScales, Skills } from "../system/references.mjs";
import BaseItemDataModel from "./base-item.mjs";

const {
    ArrayField,
    BooleanField,
    HTMLField,
    StringField,
} = foundry.data.fields;

export default class ManeuverDataModel extends BaseItemDataModel {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            type: new StringField({
                required: true,
                choices: Object.values(ManeuverTypes),
                initial: Object.values(ManeuverTypes)[0],
            }),
            resistance: new HTMLField({ required: true }),
            capability: new HTMLField({ required: true }),
            impact: new HTMLField({ required: true }),
            characteristic: new StringField({ required: true, choices: Object.values(Characteristics), initial: Object.values(Characteristics)[0] }),
            skill: new StringField({ required: true, choices: Object.values(Skills), initial: Object.values(Skills)[0] }),
            playScale: new StringField({ required: true, choices: Object.values(PlayScales), initial: PlayScales.Instantaneous }),
            actionType: new ArrayField(new StringField({
                required: true,
                choices: [
                    ...Object.values(ActionTypes),
                    None,
                ],
            })),
            additionalTimeInformation: new HTMLField({ required: true }),
            goalModifier: new StringField({
                required: true,
                choices: Object.values(ManeuverGoalModifiers),
                initial: ManeuverGoalModifiers.None,
            }),
            noVP: new BooleanField({ required: true, initial: false }),
        });
    }
}
