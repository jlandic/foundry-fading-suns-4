import { enrichHTML } from "../../utils/text-editor.mjs";

export default class OpenPerksDialog extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(options = {}) {
        super(options);
    }

    static DEFAULT_OPTIONS = {
        id: "open-perks-dialog",
        position: { width: 500, height: 600 },
        window: {
            icon: "fas fa-star",
            resizable: true,
            title: "fs4.dialogs.openPerks.title",
            contentClasses: ["open-perks"],
        },
    };

    static PARTS = {
        main: {
            template: "systems/fading-suns-4/templates/apps/open-perks.hbs",
            scrollable: [""],
        },
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        const openPerks = await globalThis.fs4.registry.getAllOpenPerks();
        openPerks.sort((a, b) => a.name.localeCompare(b.name));
        const perks = await Promise.all(openPerks.map(async (perk) => {
            return enrichHTML(`@SLUG[perk:${perk.system.slug}]`);
        }));

        foundry.utils.mergeObject(context, {
            perks,
        });

        return context;
    }
}
