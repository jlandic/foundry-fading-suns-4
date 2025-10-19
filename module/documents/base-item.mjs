export default class BaseItem extends foundry.documents.Item {
    static getDefaultArtwork(itemData) {
        let icon = this.DEFAULT_ICON;

        switch (itemData.type) {
            case "affliction": icon = "icons/magic/control/silhouette-aura-energy.webp"; break;
            case "class": icon = "icons/skills/trades/academics-scribe-quill-gray.webp"; break;
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
