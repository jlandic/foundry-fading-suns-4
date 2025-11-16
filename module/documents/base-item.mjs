import { FeatureTypeMapping } from "../system/references.mjs";
import { WithModifiersMixin } from "./mixins.mjs";

export default class BaseItem extends WithModifiersMixin(
    foundry.documents.Item,
) {
    async update(data, options = {}) {
        console.log(data);
        console.log(options);
        return super.update(data, options);
    }

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
            case "eshield": icon = "icons/equipment/shield/heater-steel-segmented-purple.webp"; break;
            case "shield": icon = "icons/equipment/shield/round-wooden-reinforced-boss-steel.webp"; break;
            case "weaponFeature": icon = "icons/commodities/tech/blueprint.webp"; break;
            case "armorFeature": icon = "icons/commodities/tech/blueprint.webp"; break;
            case "shieldFeature": icon = "icons/commodities/tech/blueprint.webp"; break;
            case "armor": icon = "icons/equipment/chest/breastplate-banded-blue.webp"; break;
            case "state": icon = "icons/magic/control/hypnosis-mesmerism-eye-tan.webp"; break;
            case "power": icon = "icons/magic/control/buff-flight-wings-runes-red-yellow.webp"; break;
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

    get embeddedModifiers() {
        return [];
    }

    get featureModifiers() {
        const featureType = FeatureTypeMapping[this.type];
        if (!featureType) return [];

        return this.system.features
            .map(slug => globalThis.registry.fromSlug(slug, featureType))
            .map(feature => feature.effects?.map(e => e) || [])
            .flat();
    }

    async addFeature(slug, path = "system.features") {
        const features = foundry.utils.getProperty(this, path) || [];
        if (features.includes(slug)) return;

        features.push(slug);
        await this.update({ [path]: features });
    }
}
