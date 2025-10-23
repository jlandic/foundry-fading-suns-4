import { ActionTypes, Characteristics, ManeuverGoalModifiers, ManeuverTypes, PlayScales, Skills } from "../../system/references.mjs";
import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

export default class ManeuverSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            resistance: await enrichHTML(this.item.system.resistance),
            impact: await enrichHTML(this.item.system.impact),
            additionalTimeInformation: await enrichHTML(this.item.system.additionalTimeInformation),
            capability: await enrichHTML(this.item.system.capability),
            goalModifierOptions: this._prepareSelectOptions(
                Object.values(ManeuverGoalModifiers),
                this.item.system.goalModifier,
                "fs4.maneuver.goalModifiers"
            ),
            skillOptions: this._prepareSelectOptions(
                Object.values(Skills),
                this.item.system.skill,
                "fs4.skills",
                { sort: true }
            ),
            characteristicOptions: this._prepareSelectOptions(
                Object.values(Characteristics),
                this.item.system.characteristic,
                "fs4.characteristics",
                { sort: true }
            ),
            playScaleOptions: this._prepareSelectOptions(
                Object.values(PlayScales),
                this.item.system.playScale,
                "fs4.playScales"
            ),
            actionTypeOptions: this._prepareSelectOptions(
                Object.values(ActionTypes),
                this.item.system.actionType,
                "fs4.actionTypes",
                {
                    includeNone: true,
                }
            ),
            typeOptions: this._prepareSelectOptions(
                Object.values(ManeuverTypes),
                this.item.system.type,
                "fs4.maneuver.types"
            ),
        });

        return context;
    }
}
