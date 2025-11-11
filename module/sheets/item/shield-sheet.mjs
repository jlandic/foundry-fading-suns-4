import { EShieldTypes } from "../../system/references.mjs";
import EquipmentSheet from "./equipment-sheet.mjs";

export default class ShieldSheet extends EquipmentSheet {
    get droppableAsReferences() {
        return [
            "techCompulsion",
            "shieldFeature",
        ];
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            isEshield: this.item.type === "eshield",
            compatibilityOptions: this._prepareSelectOptions(
                Object.values(EShieldTypes),
                this.item.system.compatibility,
                "fs4.eshieldTypes"
            ),
        });

        return context;
    }

    async _onDrop(event) {
        if (event.target.classList.values().toArray().includes('editor-container')) { return; }

        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const item = await fromUuid(data.uuid);

        if (item.type === "shieldFeature") {
            await this.item.addFeature(item.system.slug);
        } else {
            await super._onDrop(event);
        }
    }
}
