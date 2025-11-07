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

const STATES = [
    "befriended",
    "anxious",
    "deafened",
    "hearing_impaired",
    "blinded",
    "berserk",
    "castigated",
    "commanded",
    "convinced",
    "guilty",
    "divinely_inspired",
    "deceived",
    "confused",
    "desensitized",
    "disoriented",
    "afraid",
    "euphoric",
    "mesmerized",
    "fatigued",
    "suspended",
    "humiliated",
    "immobilized",
    "unconscious",
    "roused",
    "daunted",
    "angered",
    "dying",
    "mangled",
    "nauseated",
    "incapacitated",
    "paralyzed",
    "penalized",
    "hindered",
    "enlightened",
    "entreated",
    "stunned",
    "stimulated",
    "terrified",
    "tormented",
    "seeing_impaired",
    "prone",
    "awed",
    "wowed",
    "dazed",
];

export const initStates = async () => {
    await initData(STATES, "state");
};
