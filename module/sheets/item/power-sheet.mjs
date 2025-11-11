import { ActionTypes, Characteristics, PlayScales, PowerDisciplines, Skills, TheurgyComponents } from "../../system/references.mjs";
import { enrichHTML } from "../../utils/text-editor.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

export default class PowerSheet extends BaseItemSheet {
    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            resistance: await enrichHTML(this.item.system.resistance),
            impact: await enrichHTML(this.item.system.impact),
            additionalCost: await enrichHTML(this.item.system.additionalCost),
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
            componentOptions: this._prepareSelectOptions(
                Object.values(TheurgyComponents),
                Object.keys(this.item.system.components)
                    .filter(key => this.item.system.components[key]),
                "fs4.power.components",
            ),
            disciplineOptions: this._prepareSelectOptions(
                Object.values(PowerDisciplines),
                this.item.system.discipline,
                "fs4.power.disciplines",
                { sort: true },
            ),
        });

        return context;
    }
}
