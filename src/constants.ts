export const DEFAULT_INITIAL_SKILL_VALUE = 3;
export enum Skill {
  Academia = 'Academia',
  Alchemy = 'Alchemy',
  Animalia = 'Animalia',
  Arts = 'Arts',
  Charm = 'Charm',
  Crafts = 'Crafts',
  Disguise = 'Disguise',
  Drive = 'Drive',
  Empathy = 'Empathy',
  Fight = 'Fight',
  Focus = 'Focus',
  Impress = 'Impress',
  Interface = 'Interface',
  Intrusion = 'Intrusion',
  Knavery = 'Knavery',
  Melee = 'Melee',
  Observe = 'Observe',
  Perform = 'Perform',
  Pilot = 'Pilot',
  Remedy = 'Remedy',
  Shoot = 'Shoot',
  SleightOfHand = 'SleightOfHand',
  Sneak = 'Sneak',
  Survival = 'Survival',
  TechRedemption = 'TechRedemption',
  Vigor = 'Vigor',
}

export const SKILLS = Object.keys(Skill).filter((key) => isNaN(Number(key)));

export const RESERVED_SKILLS = [Skill.Alchemy, Skill.Interface, Skill.Pilot];

export const CHARACTER_ITEMS: Record<string, string> = {
  blessing: 'Blessing',
  class: 'Class',
  curse: 'Curse',
  faction: 'Faction',
  species: 'Species',
  affliction: 'Affliction',
  armor: 'Armor',
  eshield: 'Eshield',
  callings: 'Calling',
  capabilities: 'Capability',
  perks: 'Perk',
  powers: 'Power',
};

export const HAS_ONE_ITEM_TYPES = [
  'Affliction',
  'Armor',
  'Blessing',
  'Class',
  'Curse',
  'Eshield',
  'Faction',
  'Species',
];
export const UNIQUE_INSTANCE_ITEM_TYPES = [
  'Calling',
  'Class',
  'Capability',
  'Perk',
  'Power',
];
