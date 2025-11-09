import EquipmentSheet from "./equipment-sheet.mjs";

export default class WeaponSheet extends EquipmentSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        actions: {
            toggleDamageType: WeaponSheet._toggleDamageType,
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
            damageTypeOptions: this._prepareDamageTypeOptions(this.item.system.damageTypes),
            features: await this._prepareInlineItemList("system.features", "weaponFeature"),
        });

        return context;
    }

    async _onDrop(event) {
        if (event.target.classList.values().toArray().includes('editor-container')) { return; }

        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const item = await fromUuid(data.uuid);

        if (item.type === "weaponFeature") {
            await this.item.addFeature(item.system.slug, "weaponFeature");
        } else {
            await super._onDrop(event);
        }
    }

    static async _toggleDamageType(event, target) {
        event.preventDefault();

        const type = target.dataset.type;
        const damageTypes = this.item.system.damageTypes;
        const index = damageTypes.indexOf(type);

        if (index === -1) {
            damageTypes.push(type);
        } else {
            damageTypes.splice(index, 1);
        }

        await this.item.update({ "system.damageTypes": damageTypes });
    }
}
