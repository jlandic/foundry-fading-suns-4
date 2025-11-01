export default class Registry {
    constructor() {
        this.collection = Object.keys(CONFIG.Item.dataModels).reduce((acc, key) => {
            acc[key] = {}
            return acc;
        }, {});
    }

    async initialize() {
        globalThis.log.info("Initializing registry of reference items");

        await game.packs.forEach(async (pack) => {
            await pack.index.forEach(async (document) => {
                if (this.collection[document.type]) {
                    const item = await fromUuid(document.uuid);
                    this.collection[document.type][item.system.slug] = document.uuid;
                }
            });
        });

        globalThis.log.info("Done initialize registry of reference items");
    }

    uuidFromSlug(slug, type) {
        if (type) {
            if (!this.collection[type]) {
                return slug;
            }

            return this.collection[type][slug] ||
                game.items.find(item => item.system.slug === slug)?.uuid;
        } else {
            return Object.values(globalThis.registry.collection).find(reference => reference[slug])[slug] ||
                game.items.find(item => item.system.slug === slug)?.uuid;
        }
    }

    fromSlug(slug, type) {
        return fromUuidSync(this.uuidFromSlug(slug, type));
    }

    async fromSlugAsync(slug, type) {
        return await fromUuid(this.uuidFromSlug(slug, type));
    }

    async getAllOfType(type) {
        const uuids = Object.values(this.collection[type] || {});
        const fromCompendium = await Promise.all(uuids.map(uuid => fromUuid(uuid)));
        const fromWorld = game.items.filter(item => item.type === type && !this.collection[type][item.system.slug]);
        return fromCompendium.concat(fromWorld);
    }
}
