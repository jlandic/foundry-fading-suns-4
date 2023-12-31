import { registerHandlebarsHelpers } from '../handlebarHelpers';
import CharacterDataModel from '../models/actor/character.datamodel';
import SimpleItemDataModel from '../models/item/simple-item.datamodel';
import SpeciesDataModel from '../models/item/species.datamodel';
import FS4CharacterSheet from '../sheets/character.sheet';
import SimpleItemSheet from '../sheets/simple-item.sheet';

const registerDataModels = (): void => {
  // @ts-expect-error outdated foundry typings - v10
  CONFIG.Actor.dataModels = {
    Character: CharacterDataModel,
  };

  // @ts-expect-error outdated foundry typings - v10
  CONFIG.Item.dataModels = {
    Class: SimpleItemDataModel,
    Upbringing: SimpleItemDataModel,
    Faction: SimpleItemDataModel,
    Calling: SimpleItemDataModel,
    Skill: SimpleItemDataModel,
    Blessing: SimpleItemDataModel,
    Curse: SimpleItemDataModel,
    Perk: SimpleItemDataModel,
    Armor: SimpleItemDataModel,
    EShield: SimpleItemDataModel,
    Species: SpeciesDataModel,
  };
};

const registerSheets = (gameId: string): void => {
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet(gameId, FS4CharacterSheet, {
    types: ['Character'],
    makeDefault: true,
    label: 'FS4.SheetClass.CharacterSheet',
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet(gameId, SimpleItemSheet, {
    types: [
      'Class',
      'Skill',
      'Faction',
      'Calling',
      'Blessing',
      'Curse',
      'Perk',
      'Upbringing',
      'Armor',
      'EShield',
      'Species',
    ],
    makeDefault: true,
    label: 'FS4.SheetClass.SimpleItemSheet',
  });
};

const registerPartials = (gameId: string): void => {
  loadTemplates([
    `systems/${gameId}/templates/partials/actor/character-header.hbs`,
    `systems/${gameId}/templates/partials/actor/bank.hbs`,
    `systems/${gameId}/templates/partials/actor/gear.hbs`,
    `systems/${gameId}/templates/partials/actor/stats.hbs`,
    `systems/${gameId}/templates/partials/actor/history.hbs`,
  ]).catch(console.error);
};

Hooks.once('init', () => {
  const { id: gameId } = (game as Game).system;

  registerDataModels();
  registerSheets(gameId);
  registerHandlebarsHelpers();
  registerPartials(gameId);
});

Hooks.once('ready', () => {
  // @ts-expect-error outdated foundry typings - v10
  fromUuidSync('Actor.12rt5oel2uDEJfdA')?.sheet?.render(true);
});
