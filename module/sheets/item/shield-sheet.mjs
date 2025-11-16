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
            capability: await this._prepareReferenceLink("system.capability", "capability"),
            isEshield: this.item.type === "eshield",
            compatibilityOptions: this._prepareSelectOptions(
                Object.values(EShieldTypes),
                this.item.system.compatibility,
                "fs4.eshieldTypes"
            ),
            damageTypeOptions: this._prepareDamageTypeOptions(this.item.system.anti || []),
            features: await this._prepareInlineItemList("system.features", "shieldFeature"),
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

    static async _toggleDamageType(event, target) {
        event.preventDefault();

        const type = target.dataset.type;
        const anti = this.item.system.anti;
        const index = anti.indexOf(type);

        if (index === -1) {
            anti.push(type);
        } else {
            anti.splice(index, 1);
        }

        await this.item.update({ "system.anti": anti });
    }
}
