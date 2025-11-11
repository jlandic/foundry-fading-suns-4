import './less/fading-suns-4.less';

import * as models from './module/models/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as sheets from './module/sheets/_module.mjs';
import FS4Logger from './module/utils/logger.mjs';
import { preloadTemplates, registerHandlebarsHelpers } from './module/utils/handlebars.mjs';
import * as initScripts from './module/scripts/initData.mjs';
import Registry from './module/utils/registry.mjs';
import { onHotbarDrop } from './module/utils/hotbar.mjs';
import { initializeChatListeners } from './module/utils/chat-listeners.mjs';
import { createStatusEffects } from './module/utils/statuses.mjs';
import { combatTurnChange } from './module/system/combat.mjs';
import { renderChatMessage } from './module/utils/chat-message.mjs';

globalThis.babelProgress = null;

Hooks.on("hotbarDrop", onHotbarDrop);
Hooks.on("combatTurnChange", combatTurnChange);
Hooks.on("renderChatMessage", renderChatMessage);

Hooks.once("init", async () => {
    globalThis.log = FS4Logger;

    globalThis.log.info("Initializing Fading Suns 4 system");

    CONFIG.Item.dataModels = {
        affliction: models.AfflictionDataModel,
        blessing: models.BlessingDataModel,
        techCompulsion: models.TechCompulsionDataModel,
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
        armor: models.ArmorDataModel,
        shield: models.ShieldDataModel,
        eshield: models.EShieldDataModel,
        weaponFeature: models.WeaponFeatureDataModel,
        armorFeature: models.ArmorFeatureDataModel,
        shieldFeature: models.ShieldFeatureDataModel,
        state: models.StateDataModel,
        power: models.PowerDataModel,
    };
    CONFIG.Item.documentClass = documents.ProxyItem;

    CONFIG.specialStatusEffects.DEFEATED = "dying";

    CONFIG.Actor.dataModels = {
        pc: models.PCDataModel,
        headliner: models.HeadlinerDataModel,
        agent: models.AgentDataModel,
        extra: models.ExtraDataModel,
    };
    CONFIG.Actor.documentClass = documents.BaseActor;
    CONFIG.Actor.trackableAttributes = {
        pc: {
            bar: ["vitality"],
            value: ["vp.cache"],
        },
        headliner: {
            bar: ["vitality"],
            value: ["vp.cache"],
        },
        agent: {
            bar: ["vitality"],
            value: ["vp.cache"],
        },
        extra: {
            bar: ["vitality"],
            value: [],
        },
    };

    CONFIG.ActiveEffect.dataModels.modifier = models.BaseActiveEffectDataModel;
    CONFIG.ActiveEffect.documentClass = documents.BaseActiveEffect;

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.SimpleItemWithModifiersSheet, { types: ["blessing", "techCompulsion", "curse", "weaponFeature", "armorFeature", "shieldFeature"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.AfflictionSheet, { types: ["affliction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.CallingSheet, { types: ["calling"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.CapabilitySheet, { types: ["capability"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ClassSheet, { types: ["class"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.FactionSheet, { types: ["faction"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ManeuverSheet, { types: ["maneuver"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.PerkSheet, { types: ["perk"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.SpeciesSheet, { types: ["species"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.StateSheet, { types: ["state"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.PowerSheet, { types: ["power"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.EquipmentSheet, { types: ["equipment"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.WeaponSheet, { types: ["weapon"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ArmorSheet, { types: ["armor"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Item, "fading-suns-4", sheets.ShieldSheet, { types: ["shield", "eshield"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "fading-suns-4", sheets.NPCSheet, { types: ["headliner", "agent"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "fading-suns-4", sheets.PCSheet, { types: ["pc"], makeDefault: true });
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, "fading-suns-4", sheets.ExtraSheet, { types: ["extra"], makeDefault: true });

    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.ActiveEffect, "fading-suns-4", sheets.ModifierSheet, { types: ["modifier"], makeDefault: true });

    await preloadTemplates();

    globalThis.Babele?.get()?.registerConverters({
        "translateEffects": (effects, translations) => {
            return effects.map((effect) => {
                if (translations) {
                    let translation = translations[effect._id];
                    const translated = {
                        name: translation?.name || effect.name,
                        system: {
                            notes: translation?.notes || effect.system.notes,
                        },
                    };

                    if (translation) {
                        effect = foundry.utils.mergeObject(effect, translated);
                    }
                }

                return effect;
            });
        },
    });
});

Hooks.once("ready", async () => {
    globalThis.registry = new Registry();
    await globalThis.registry.initialize();

    if (game.user.isGM) {
        globalThis.initScripts = initScripts;
    }

    if (globalThis.Babele) {
        globalThis.babelProgress = ui.notifications.info(game.i18n.localize("fs4.notifications.babele.loading"), { progress: true });
    }

    initializeChatListeners();
    registerHandlebarsHelpers();

    if (!globalThis.Babele) {
        await createStatusEffects();
    }
});

Hooks.once("babele.ready", async () => {
    globalThis.babelProgress.update({ message: game.i18n.localize("fs4.notifications.babele.loaded"), pct: 1 });
    globalThis.babelProgress = undefined;

    await createStatusEffects();
});
