export const SPECIAL_REFERENCE_PREFIX = "special_";

export const None = "none";

export const PreconditionTypes = Object.freeze({
    Calling: "calling",
    Capability: "capability",
    Class: "class",
    Faction: "faction",
    PowerSkill: "power_skill",
    Skill: "skill",
    Special: "special",
    Species: "species",
    Perk: "perk",
});

export const Characteristics = Object.freeze({
    Strength: "strength",
    Dexterity: "dexterity",
    Endurance: "endurance",
    Wits: "wits",
    Perception: "perception",
    Will: "will",
    Presence: "presence",
    Intuition: "intuition",
    Faith: "faith",
});

export const INITIAL_CHARACTERISTIC_VALUE = 3;

export const CharacteristicsSpecials = Object.freeze({
    DistributePoints: "special_distribute_points",
});

export const CharacteristicsGroups = Object.freeze({
    Body: "body",
    Mind: "mind",
    Spirit: "spirit",
});

export const CharacteristicsGroupMap = Object.freeze({
    [CharacteristicsGroups.Body]: [
        Characteristics.Strength,
        Characteristics.Dexterity,
        Characteristics.Endurance,
    ],
    [CharacteristicsGroups.Mind]: [
        Characteristics.Wits,
        Characteristics.Perception,
        Characteristics.Will,
    ],
    [CharacteristicsGroups.Spirit]: [
        Characteristics.Presence,
        Characteristics.Intuition,
        Characteristics.Faith,
    ],
});

export const ResistanceTypes = Object.freeze({
    Body: "body",
    Mind: "mind",
    Spirit: "spirit",
});

export const Skills = Object.freeze({
    Academia: "academia",
    Alchemy: "alchemy",
    Animalia: "animalia",
    Arts: "arts",
    Charm: "charm",
    Crafts: "crafts",
    Disguise: "disguise",
    Drive: "drive",
    Empathy: "empathy",
    Fight: "fight",
    Focus: "focus",
    Impress: "impress",
    Interface: "interface",
    Intrusion: "intrusion",
    Knavery: "knavery",
    Melee: "melee",
    Observe: "observe",
    Perform: "perform",
    Pilot: "pilot",
    Remedy: "remedy",
    Shoot: "shoot",
    SleightOfHand: "sleightofhand",
    Sneak: "sneak",
    Survival: "survival",
    TechRedemption: "techredemption",
    Vigor: "vigor",
});

export const RESERVED_SKILLS = [
    Skills.Alchemy,
    Skills.Interface,
    Skills.Pilot,
];

export const INITIAL_SKILL_VALUE = 3;
export const INITIAL_RESERVED_SKILL_VALUE = 0;

export const SkillsSpecials = Object.freeze({
    DistributePoints: "special_distribute_points",
});

export const PowerSkills = Object.freeze({
    Psi: "psi",
    Theurgy: "theurgy",
});

export const PerkTypes = Object.freeze({
    Ability: "ability",
    Austerity: "austerity",
    Birthright: "birthright",
    Cyberdevice: "cyberdevice",
    Power: "power",
    Privilege: "privilege",
    Verve: "verve",
});

export const PerkSourceTypes = Object.freeze({
    Species: "species",
    Class: "class",
    Calling: "calling",
});

export const CapabilityTypes = Object.freeze({
    Equipment: "equipment",
    Lores: "lores",
});

export const CapabilityCategories = Object.freeze({
    // equipment
    Armor: "armor",
    MeleeWeapons: "melee_weapons",
    MilitaryOrdnance: "military_ordnance",
    MusicalInstruments: "musical_instruments",
    RangedWeapons: "ranged_weapons",
    ThinkMachines: "think_machines",
    Transport: "transport",

    // lores
    Arts: "arts",
    Crafts: "crafts",
    Customs: "customs",
    Knowledge: "knowledge",
    Medical: "medical",
    PerformingArts: "performing_arts",
    Science: "science",
    Technology: "technology",
});

export const PlayScales = Object.freeze({
    PresentTense: "present_tense",
    Instantaneous: "instantaneous",
    Narrated: "narrated",
});

export const TimeScales = Object.freeze({
    Turn: "turn",
    Round: "round",
    Moment: "moment",
    Scene: "scene",
    Act: "act",
    Drama: "drama",
    Epic: "epic",
});

export const ActionTypes = Object.freeze({
    Primary: "primary",
    ReflexivePrimary: "reflexive_primary",
    Secondary: "secondary",
    ReflexiveSecondary: "reflexive_secondary",
    Movement: "movement",
});

export const ManeuverTypes = Object.freeze({
    Action: "action",
    Combat: "combat",
    Defense: "defense",
    Influence: "influence",
    InfluencePersuasion: "influence_persuasion",
    InfluenceCoercion: "influence_coercion",
});

export const ManeuverGoalModifiers = Object.freeze({
    None: "none",
    MeleeWeapon: "melee_weapon",
    RangedWeapon: "ranged_weapon",
});

export const BASIC_MANEUVERS = Object.freeze([
    "shake_it_off_body",
    "shake_it_off_mind",
    "shake_it_off_spirit",
]);

export const ModifierValueTypes = Object.freeze({
    Constant: "constant",
    Formula: "formula",
    Favorable: "favorable",
    Unfavorable: "unfavorable",
});

export const ModifierTargetTypes = Object.freeze({
    None: "none",
    Skill: "skill",
    Characteristic: "characteristic",
    Resistance: "resistance",
    Initiative: "initiative",
    Goal: "goal",
    Damage: "damage",
});

export const InitiativeModifierTypes = Object.freeze({
    Edge: "edge",
    Hindmost: "hindmost",
});

export const ModifierTypes = Object.freeze({
    Austerity: "austerity",
    Untyped: "untyped",
});

export const ModifierContexts = Object.freeze({
    None: "none",
    RangedAttack: "ranged",
    MeleeAttack: "melee",
    InfluencePersuasion: "influence_persuasion",
    InfluenceCoercion: "influence_coercion",
    Influence: "influence",
    Defense: "defense",
    SpecificManeuver: "specific_maneuver",
});

export const RollFavor = Object.freeze({
    Unfavorable: -1,
    Normal: 0,
    Favorable: 1,
});

export const EquipmentQualities = Object.freeze({
    Disrepair: "disrepair",
    Unreliable: "unreliable",
    PoorWorkmanship: "poor_workmanship",
    Standard: "standard",
    Superior: "superior",
    Masterwork: "masterwork",
    Premium: "premium",
});

export const EquipmentCostMultipliers = Object.freeze({
    [EquipmentQualities.Disrepair]: 0.7,
    [EquipmentQualities.Unreliable]: 0.8,
    [EquipmentQualities.PoorWorkmanship]: 0.9,
    [EquipmentQualities.Standard]: 1.0,
    [EquipmentQualities.Superior]: 1.1,
    [EquipmentQualities.Masterwork]: 1.2,
    [EquipmentQualities.Premium]: 1.3,
});

export const EquipmentSizes = Object.freeze({
    None: "none",
    XXS: "xxs",
    XS: "xs",
    S: "s",
    M: "m",
    L: "l",
    XL: "xl",
    XXL: "xxl",
});

export const DamageTypes = Object.freeze({
    Blstr: "blaster",
    Flm: "flame",
    Hrd: "hard",
    Lsr: "laser",
    Shk: "shock",
    Slm: "slam",
    Son: "sonic",
});

export const WeaponTypes = Object.freeze({
    Melee: "melee",
    Ranged: "ranged",
});

export const EShieldTypes = Object.freeze({
    Es: "es",
    Ea: "ea",
    Eb: "eb",
});

export const TECHGNOSIS_TL_MAX = 4;

export const Resistance = Object.freeze({
    Effortless: "effortless",
    Easy: "easy",
    Hard: "hard",
    Demanding: "demanding",
    Tough: "tough",
    Severe: "severe",
    Herculean: "herculean",
    Miraculous: "miraculous",
});

export const ResistanceValues = Object.freeze({
    Effortless: 0,
    Easy: 2,
    Hard: 4,
    Demanding: 6,
    Tough: 8,
    Severe: 10,
    Herculean: 12,
    Miraculous: 14,
});
