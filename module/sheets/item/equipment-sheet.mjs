import { DamageTypes, EquipmentQualities, EquipmentSizes } from "../../system/references.mjs";
import BaseItemSheet from "./base-item-sheet.mjs";

export default class EquipmentSheet extends BaseItemSheet {
    static TABS = {
        primary: {
            initial: "main",
            tabs: [
                this.TAB_REFERENCES.main,
                this.TAB_REFERENCES.modifiers,
            ]
        }
    };

    get droppableAsReferences() {
        return [
            "techCompulsion",
        ];
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            qualityOptions: this._prepareSelectOptions(
                Object.values(EquipmentQualities),
                this.item.system.quality,
                "fs4.equipment.qualities"
            ),
            sizeOptions: this._prepareSelectOptions(
                Object.values(EquipmentSizes),
                this.item.system.size,
                "fs4.size.short"
            ),
            techCompulsion: await this._prepareReferenceLink("system.techCompulsion", "techCompulsion"),
        });

        return context;
    }

    _prepareDamageTypeOptions(selectedTypes) {
        return Object.values(DamageTypes).map((type) => ({
            label: game.i18n.localize(`fs4.damageTypes.short.${type}`),
            title: game.i18n.localize(`fs4.damageTypes.${type}`),
            type,
            checked: selectedTypes.includes(type),
        }));
    }
}
