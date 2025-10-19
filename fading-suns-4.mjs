import './less/fading-suns-4.less';

import * as models from './module/models/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as sheets from './module/sheets/_module.mjs';
import Logger from './module/utils/logger.mjs';
import { preloadTemplates } from './module/utils/handlebars.mjs';
import * as initScripts from './module/scripts/initData.mjs';
import Registry from './module/utils/registry.mjs';

Hooks.once("init", async () => {
    globalThis.logger = Logger;

    globalThis.logger.info("Initializing Fading Suns 4 system");

    CONFIG.Item.dataModels = {
        affliction: models.AfflictionDataModel,
        class: models.ClassDataModel,
        perk: models.PerkDataModel,
        species: models.SpeciesDataModel,
    };
    CONFIG.Item.documentClass = documents.ProxyItem;

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.AfflictionSheet, { types: ["affliction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ClassSheet, { types: ["class"], makeDefault: true });
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
});
