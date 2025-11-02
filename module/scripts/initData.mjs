import { ProxyItem } from "../documents/proxy-item.mjs"

const initData = async (slugs, type, transformFn) => {
    const folder = await Folder.create({ name: type, type: "Item", parent: null });
    const documents = slugs.map(slug => ({
        type: type,
        name: slug,
        folder: folder.id,
        system: {
            slug,
        },
    }));

    await ProxyItem.createDocuments(transformFn ? documents.map(transformFn) : documents);
}

const WEAPON_FEATURES = [
    "2_handed",
    "aquatic",
    "noisy",
    "disguised_weapon",
    "build_in_knuckleduster",
    "stock",
    "explo",
    "guard",
    "undetectable",
    "unstable",
    "military",
    "mangle",
    "unwieldy_weapon",
    "poison",
    "sturdy",
    "single_use",
    "vibro",
    "area_5m",
    "area",
    "stylish",
];

const SHIELD_FEATURES = [
    "noisy_upon_activation",
    "disguised_shield",
    "unwieldy_shield",
    "noisy_when_activated",
];

const ARMOR_FEATURES = [
    "abc_armor",
    "hindering",
];

export const initWeaponFeatures = async () => {
    await initData(WEAPON_FEATURES, "weaponFeature");
};

export const initShieldFeatures = async () => {
    await initData(SHIELD_FEATURES, "shieldFeature");
};

export const initArmorFeatures = async () => {
    await initData(ARMOR_FEATURES, "armorFeature");
};
