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

const BLESSINGS = [
    "extrovert",
    "suspicious",
    "unyielding",
    "disciplined",
    "pious",
    "curious",
    "compassionate",
    "innovative",
    "bold",
    "shrewd",
    "the_man",
    "taciturn",
    "alert_blessing",
]

const CURSES = [
    "impetuous",
    "vain",
    "prideful",
    "vengeful",
    "dynastic_stain",
    "clueless",
    "subtle",
    "gullible",
    "righteous",
    "austere",
    "nosy",
    "unnerving",
    "callous",
    "mammon",
    "possessive",
    "twitchy",
    "bitter",
    "fidgety",
    "uncouth_curse",
]

export const initBlessingsAndCurses = async () => {
    await initData(BLESSINGS, "blessing");
    await initData(CURSES, "curse");
};
