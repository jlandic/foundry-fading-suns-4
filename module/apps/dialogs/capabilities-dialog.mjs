import { enrichHTML } from "../../utils/text-editor.mjs";

export default class CapabilitiesDialog extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(options = {}) {
        super(options);
    }

    static DEFAULT_OPTIONS = {
        id: "capabilities-dialog",
        position: { width: 600, height: 700 },
        window: {
            icon: "fas fa-book",
            resizable: true,
            title: "fs4.dialogs.capabilities.title",
            contentClasses: ["capabilities"],
        },
    };

    static PARTS = {
        main: {
            template: "systems/fading-suns-4/templates/apps/capabilities.hbs",
            scrollable: [""],
        },
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        const allCapabilities = await globalThis.fs4.registry.getAllOfType("capability");

        // Group by type and category
        const grouped = {};
        for (const cap of allCapabilities) {
            const type = cap.system.type;
            const category = cap.system.category;

            if (!grouped[type]) {
                grouped[type] = {};
            }
            if (!grouped[type][category]) {
                grouped[type][category] = [];
            }

            grouped[type][category].push(cap);
        }

        // Build structured array with enriched HTML
        const capabilityGroups = [];
        for (const [typeKey, categories] of Object.entries(grouped)) {
            const categoryGroups = [];
            for (const [categoryKey, caps] of Object.entries(categories)) {
                caps.sort((a, b) => a.name.localeCompare(b.name));
                const enrichedCaps = await Promise.all(caps.map(async (cap) => {
                    return enrichHTML(`@SLUG[capability:${cap.system.slug}]`);
                }));

                categoryGroups.push({
                    name: game.i18n.localize(`fs4.capability.categories.${categoryKey}`),
                    capabilities: enrichedCaps,
                });
            }
            categoryGroups.sort((a, b) => a.name.localeCompare(b.name));

            capabilityGroups.push({
                name: game.i18n.localize(`fs4.capability.types.${typeKey}`),
                categories: categoryGroups,
            });
        }
        capabilityGroups.sort((a, b) => a.name.localeCompare(b.name));

        foundry.utils.mergeObject(context, {
            capabilityGroups,
        });

        return context;
    }
}
