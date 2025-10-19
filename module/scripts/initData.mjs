import { ProxyItem } from "../documents/proxy-item.mjs"

const initData = async (slugs, type) => {
    const folder = await Folder.create({ name: type, type: "Item", parent: null });
    const documents = slugs.map(slug => ({
        type: type,
        name: slug,
        folder: folder.id,
        system: {
            slug,
        },
    }));

    await ProxyItem.createDocuments(documents);
}

const PERKS = [
    "enlightened_endowment",
    "sagacity",
    "serene",
    "alert",
    "sensitive_touch",
    "bite",
    "brutal",
    "huge",
    "no_occult",
    "noble_claw",
    "predatory",
    "sensitive_smell",
    "uncouth",
]

const SPECIES = [
    "human",
    "obun",
    "ukar",
    "vorox",
];

export const initSpeciesData = async () => {
    await initData(SPECIES, "species");
}

export const initPerkData = async () => {
    await initData(PERKS, "perk");
}
