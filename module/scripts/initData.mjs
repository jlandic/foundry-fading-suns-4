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

const TECH_COMPULSIONS = [
    "acquisitive",
    "bloodthirsty",
    "cruel",
    "destructive",
    "heedless",
    "hypercritical",
    "indiscreet",
    "industrious",
    "inerrant",
    "pretentious",
    "protective",
    "reckless",
    "solicitous",
];

export const initTechCompulsionData = async () => {
    await initData(TECH_COMPULSIONS, "techCompulsion");
};
