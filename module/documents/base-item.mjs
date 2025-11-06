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
            case "techCompulsion": icon = "icons/commodities/tech/tube-chamber-lightning.webp"; break;
            case "weapon": icon = "icons/weapons/swords/swords-short.webp"; break;
            case "shield": icon = "icons/armor/shields/shield-round-brown-steel.webp"; break;
            case "weaponFeature": icon = "icons/commodities/tech/blueprint.webp"; break;
            case "armorFeature": icon = "icons/commodities/tech/blueprint.webp"; break;
            case "shieldFeature": icon = "icons/commodities/tech/blueprint.webp"; break;
        }

        return {
            img: icon,
            texture: {
                src: icon,
            },
        };
    }

    async addReference(property, slug) {
        await this.update({ [property]: slug });
    }

    async removeReference(property) {
        await this.update({ [property]: null });
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

    async addFeature(slug, type, path = "system.features") {
        const feature = globalThis.registry.fromSlug(slug, type);
        if (!feature) return;

        const features = foundry.utils.getProperty(this.system, path) || [];
        if (!features.includes(slug)) {
            features.push(slug);
            feature.effects.forEach((effect) => {
                this.createEmbeddedDocuments("ActiveEffect", [{
                    name: effect.name,
                    disabled: false,
                    origin: slug,
                    system: {
                        ...effect.system,
                    }
                }]);
            });
            return await this.update({ [path]: features });
        }
    }

    async clearImportedEffects(slug) {
        const effectsToRemove = this.effects.filter(effect => effect.origin === slug);
        if (effectsToRemove.size > 0) {
            return await this.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove.map(e => e.id));
        }
    }
}
