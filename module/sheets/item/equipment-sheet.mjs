import { EquipmentQualities } from "../../system/references.mjs";
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
            techCompulsion: await this._prepareReferenceLink("system.techCompulsion", "techCompulsion"),
        });

        return context;
    }
}
