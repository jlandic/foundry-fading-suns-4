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
    Skill: SimpleItemDataModel,
    Faction: SimpleItemDataModel,
    Calling: SimpleItemDataModel,
    Blessing: SimpleItemDataModel,
    Curse: SimpleItemDataModel,
    Perk: SimpleItemDataModel,
    Power: SimpleItemDataModel,
    Armor: SimpleItemDataModel,
    EShield: SimpleItemDataModel,
    Species: SpeciesDataModel,
  };
};

const registerSheets = (): void => {
  const { id: gameId } = (game as Game).system;

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
      'Power',
      'Armor',
      'EShield',
      'Species',
    ],
    makeDefault: true,
    label: 'FS4.SheetClass.SimpleItemSheet',
  });
};

Hooks.on('init', () => {
  registerDataModels();
  registerSheets();
  registerHandlebarsHelpers();
});
