export default class BaseItem extends foundry.documents.Item {
    static getDefaultArtwork(itemData) {
        let icon = this.DEFAULT_ICON;

        switch (itemData.type) {
            case "affliction": icon = "icons/magic/control/silhouette-aura-energy.webp"; break;
            case "blessing": icon = "icons/magic/symbols/mask-metal-silver-white.webp"; break;
            case "calling": icon = "icons/magic/control/silhouette-grow-shrink-blue.webp"; break;
            case "capability": icon = "icons/sundries/scrolls/scroll-bound-blue-red.webp"; break;
            case "class": icon = "icons/skills/trades/academics-scribe-quill-gray.webp"; break;
            case "curse": icon = "icons/magic/symbols/mask-yellow-orange.webp"; break;
            case "faction": icon = "icons/sundries/flags/banner-blue.webp"; break;
            case "maneuver": icon = "icons/magic/symbols/cog-orange-red.webp"; break;
            case "perks": icon = "icons/magic/control/buff-flight-wings-blue.webp"; break;
            case "species": icon = "icons/magic/control/silhouette-grow-shrink-tan.webp"; break;
        }

        return {
            img: icon,
            texture: {
                src: icon,
            },
        };
    }

    async addNewModifier() {
        return await this.createEmbeddedDocuments("ActiveEffect", [
            {
                name: this.name,
                disabled: false,
            }
        ]);
    }

    async toggleModifier(id) {
        const effect = this.effects.get(id);
        if (!effect) return;

        return await effect.update({ disabled: !effect.disabled });
    }

    async removeModifier(modifierId) {
        return await this.deleteEmbeddedDocuments("ActiveEffect", [modifierId]);
    }
}
