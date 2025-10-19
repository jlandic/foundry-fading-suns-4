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

const FACTIONS = [
    "al_malik",
    "charioteers",
    "vuldrok_barbarians",
    "decados",
    "far",
    "brother_battle_faction",
    "hawkwood",
    "hazat",
    "engineers",
    "the_muster",
    "the_dispossessed",
    "the_reeves",
    "li_halan",
    "eskatonic_order",
    "urth_orthodox",
    "scravers",
    "ramakrishna",
    "sanctuary_aeon",
    "society_st_paulus",
    "temple_avesti",
    "vagabonds",
];

export const initFactionData = async () => {
    await initData(FACTIONS, "faction");
}

const PERKS = [
    "noble_title_2",
    "noble_title_3",
    "noble_title_4",
    "noble_title_5",
    "noble_title_6",
    "church_ordination_2",
    "church_ordination_3",
    "church_ordination_4",
    "church_ordination_5",
    "church_ordination_6",
    "guild_commission_2",
    "guild_commission_3",
    "guild_commission_4",
    "guild_commission_5",
    "guild_commission_6",
    "rep_2",
    "rep_3",
    "rep_4",
    "rep_5",
    "rep_6",
];

export const initPerkData = async () => {
    await initData(PERKS, "perk", (perk) => {
        const base = perk.system.slug.split("_").slice(0, -1).join("_");
        const level = parseInt(perk.system.slug.split("_").pop());
        let previousLevel = base;
        let nextLevel = undefined;

        const baseDocument = globalThis.registry.fromSlug(base, "perk");

        if (level > 2) {
            previousLevel = `${base}_${level - 1}`;
        }

        if (level < 6) {
            nextLevel = `${base}_${level + 1}`;
        }

        return {
            ...perk,
            system: {
                ...perk.system,
                description: baseDocument.system.description,
                benefice: baseDocument.system.benefice,
                preconditions: baseDocument.system.preconditions,
                sourceType: baseDocument.system.sourceType,
                type: baseDocument.system.type,
                previousLevel,
                nextLevel,
            },
        };
    });
}
