import { EShieldTypes } from "../../system/references.mjs";
import EquipmentSheet from "./equipment-sheet.mjs";

export default class ArmorSheet extends EquipmentSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        actions: {
            toggleDamageType: ArmorSheet._toggleDamageType,
        },
    });

    get droppableAsReferences() {
        return [
            "capability",
            "techCompulsion",
        ];
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            capability: await this._prepareReferenceLink("system.capability", "capability"),
            damageTypeOptions: this._prepareDamageTypeOptions(this.item.system.anti),
            features: await this._prepareInlineItemList("system.features", "armorFeature"),
            eshieldTypeOptions: this._prepareSelectOptions(
                Object.values(EShieldTypes),
                this.item.system.eshieldCompatibility,
                "fs4.eshieldTypes"
            ),
        });

        return context;
    }

    async _onDrop(event) {
        if (event.target.classList.values().toArray().includes('editor-container')) { return; }

        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const item = await fromUuid(data.uuid);

        if (item.type === "armorFeature") {
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
