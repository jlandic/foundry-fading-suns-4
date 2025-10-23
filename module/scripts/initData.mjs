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

const CALLINGS = [
    "actor",
    "amateur",
    "artist",
    "banker",
    "bounty_hunter",
    "brother_battle",
    "chainer",
    "chorister",
    "clergy",
    "commander",
    "confessor",
    "conspiracist",
    "courtier",
    "detective",
    "dreamtender",
    "duelist",
    "enthusiast",
    "explorer",
    "friar",
    "healer",
    "imperial_cohort_merchant",
    "imperial_cohort_priest",
    "incognito",
    "inquisitor",
    "knightly_order",
    "lawyer",
    "lord",
    "mendicant",
    "mercenary",
    "mercurian",
    "monk",
    "musician",
    "occultist",
    "pirate",
    "pistol_duelist",
    "psychic",
    "questing_knight",
    "reclaimer",
    "ronin",
    "scholar",
    "scout",
    "scribe",
    "smuggler",
    "spy_merchant",
    "star_pilot",
    "sybarite",
    "tech_redeemer",
    "templar",
    "theurgist",
    "thief",
    "trader",
    "tycoon",
]

export const initCallings = async () => {
    await initData(CALLINGS, "calling");
}
