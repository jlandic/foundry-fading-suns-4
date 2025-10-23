export const SPECIAL_REFERENCE_PREFIX = "special_";

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

export const CharacteristicsSpecials = Object.freeze({
    DistributePoints: "special_distribute_points",
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
