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
}
