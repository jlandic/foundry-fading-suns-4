import './less/fading-suns-4.less';

import * as models from './module/models/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as sheets from './module/sheets/_module.mjs';
import FS4Logger from './module/utils/logger.mjs';
import { preloadTemplates } from './module/utils/handlebars.mjs';
import * as initScripts from './module/scripts/initData.mjs';
import Registry from './module/utils/registry.mjs';
import { onHotbarDrop } from './module/utils/hotbar.mjs';

globalThis.babelProgress = null;

Hooks.once("init", async () => {
    globalThis.log = FS4Logger;

    globalThis.log.info("Initializing Fading Suns 4 system");

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
        equipment: models.EquipmentDataModel,
        weapon: models.WeaponDataModel,
        weaponFeature: models.WeaponFeatureDataModel,
        armorFeature: models.ArmorFeatureDataModel,
        shieldFeature: models.ShieldFeatureDataModel,
    };
    CONFIG.Item.documentClass = documents.ProxyItem;

    CONFIG.Actor.dataModels = {
        pc: models.PCDataModel,
        headliner: models.HeadlinerDataModel,
        agent: models.AgentDataModel,
        extra: models.ExtraDataModel,
    };
    CONFIG.Actor.documentClass = documents.BaseActor;

    CONFIG.ActiveEffect.dataModels.base = models.BaseActiveEffectDataModel;
    CONFIG.ActiveEffect.documentClass = documents.BaseActiveEffect;

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.SimpleItemWithModifiersSheet, { types: ["blessing", "curse", "weaponFeature", "armorFeature", "shieldFeature"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.AfflictionSheet, { types: ["affliction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.CallingSheet, { types: ["calling"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.CapabilitySheet, { types: ["capability"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ClassSheet, { types: ["class"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.FactionSheet, { types: ["faction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ManeuverSheet, { types: ["maneuver"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.PerkSheet, { types: ["perk"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.SpeciesSheet, { types: ["species"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.EquipmentSheet, { types: ["equipment"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.WeaponSheet, { types: ["weapon"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "fading-suns-4", sheets.NPCSheet, { types: ["headliner", "agent"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "fading-suns-4", sheets.PCSheet, { types: ["pc"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "fading-suns-4", sheets.ExtraSheet, { types: ["extra"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.ActiveEffect, "fading-suns-4", sheets.ModifierSheet, { makeDefault: true });

    await preloadTemplates();

    Hooks.on("hotbarDrop", onHotbarDrop);
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
