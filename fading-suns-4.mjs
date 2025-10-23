import './less/fading-suns-4.less';

import * as models from './module/models/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as sheets from './module/sheets/_module.mjs';
import Logger from './module/utils/logger.mjs';
import { preloadTemplates } from './module/utils/handlebars.mjs';
import * as initScripts from './module/scripts/initData.mjs';
import Registry from './module/utils/registry.mjs';

globalThis.babelProgress = null;

Hooks.once("init", async () => {
    globalThis.logger = Logger;

    globalThis.logger.info("Initializing Fading Suns 4 system");

    CONFIG.Item.dataModels = {
        affliction: models.AfflictionDataModel,
        blessing: models.BlessingDataModel,
        calling: models.CallingDataModel,
        capability: models.CapabilityDataModel,
        class: models.ClassDataModel,
        curse: models.CurseDataModel,
        faction: models.FactionDataModel,
        maneuver: models.ManeuverDataModel,
        perk: models.PerkDataModel,
        species: models.SpeciesDataModel,
    };
    CONFIG.Item.documentClass = documents.ProxyItem;

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.SimpleItemWithModifiersSheet, { types: ["blessing", "curse"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.AfflictionSheet, { types: ["affliction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.CallingSheet, { types: ["calling"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.CapabilitySheet, { types: ["capability"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ClassSheet, { types: ["class"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.FactionSheet, { types: ["faction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ManeuverSheet, { types: ["maneuver"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.PerkSheet, { types: ["perk"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.SpeciesSheet, { types: ["species"], makeDefault: true });

    await preloadTemplates();
});

Hooks.once("ready", async () => {
    globalThis.registry = new Registry();
    await globalThis.registry.initialize();

    if (game.user.isGM) {
        globalThis.initScripts = initScripts;
    }

    globalThis.babelProgress = ui.notifications.info(game.i18n.localize("fs4.notifications.babele.loading"), { progress: true });
});

Hooks.once("babele.ready", () => {
    globalThis.babelProgress.update({ message: game.i18n.localize("fs4.notifications.babele.loaded"), pct: 1 });
    globalThis.babelProgress = undefined;
})
