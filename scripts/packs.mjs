import path from "path";
import fs from "fs/promises";
import { Command } from "commander";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

const IDS = "source/ids.csv";
const SOURCE_DIR = "source";
const DB_DIR = "dist/packs";
const REF_DIR = "references";
const BABELE_COMPENDIUM_FOLDER = process.env.BABELE_COMPENDIUM_FOLDER;
const PACKS = [
    "items/afflictions",
    "items/blessings",
    "items/callings",
    "items/capabilities",
    "items/classes",
    "items/curses",
    "items/factions",
    "items/maneuvers",
    "items/perks",
    "items/species",
    "items/equipmentFeatures",
    "items/weapons",
    "items/armors",
    "items/shields",
    "items/techCompulsions",
    "items/equipment",
    "items/states",
    "items/psiPowers",
];

const TEMPLATE_PACK_MAPPING = {
    melee: "weapons",
    weaponFeature: "equipmentFeatures",
    weapon: "weapons",
    armor: "armors",
    equipment: "equipment",
    maneuver: "maneuvers",
    state: "states",
    psiPower: "psiPowers",
};

const TEMPLATE_TYPE_MAPPING = {
    melee: "weapon",
    weaponFeature: "equipmentFeature",
    psiPower: "power",
};

const TYPE_MAPPING = {}

const initializeTypeMapping = async () => {
    const data = await fs.readFile(IDS, "utf-8");
    const lines = data.split("\n").filter(line => line.trim().length > 0);

    for (const line of lines) {
        const [id, type] = line.split(",").map(part => part.trim());
        TYPE_MAPPING[id] = type;
    }
}

const randomID = (length = 16) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const cutoff = 0x100000000 - (0x100000000 % chars.length);
    const random = new Uint32Array(length);
    do {
        crypto.getRandomValues(random);
    } while (random.some(x => x >= cutoff));
    let id = "";
    for (let i = 0; i < length; i++) id += chars[random[i] % chars.length];
    return id;
}

const compile = async () => {
    for (const pack of PACKS) {
        const dbPath = path.join(DB_DIR, pack.split("/").pop());
        const sourcePath = path.join(SOURCE_DIR, pack);

        console.log(`Compiling pack from ${sourcePath} to ${dbPath}...`);
        await compilePack(sourcePath, dbPath, { log: true, yaml: false });

        console.log(`Compiled pack: ${pack}`);
    }

    console.log("All packs compiled.");
}

const extract = async () => {
    for (const pack of PACKS) {
        const dbPath = path.join(DB_DIR, pack.split("/").pop());
        const sourcePath = path.join(SOURCE_DIR, pack);

        console.log(`Extracting pack from ${dbPath} to ${sourcePath}...`);
        await extractPack(dbPath, sourcePath, {
            yaml: false, clean: false, log: true,
        });

        console.log(`Extracted pack: ${pack}`);
    }

    console.log("All packs extracted.");
}

const TRANSFORMERS = {
    states: async (original, reference) => {
        return {
            ...original,
            img: reference.img,
            system: {
                ...original.system,
                type: reference.system.type,
            },
        };
    },
};

const importReference = async (collection) => {
    await initializeTypeMapping();
    console.log(`Importing reference data: ${collection}...`);
    const refPath = path.join(REF_DIR, collection);
    const originalPath = path.join(SOURCE_DIR, "items", collection);

    const originalCollection = await fs.readdir(originalPath)
        .then(files => Promise.all(
            files.map(file => fs.readFile(path.join(originalPath, file), "utf-8")
                .then(data => ({
                    data: JSON.parse(data),
                    path: path.join(originalPath, file),
                }))
            )
        ));
    const referenceCollection = await fs.readdir(refPath)
        .then(files => Promise.all(
            files.map(file => fs.readFile(path.join(refPath, file), "utf-8")
                .then(data => ({
                    data: JSON.parse(data),
                    path: path.join(refPath, file),
                }))
            )
        ));

    for (const item of originalCollection) {
        const reference = referenceCollection.find(i => i.data.system.id === item.data.system.slug);
        if (!reference) {
            console.warn(`No reference found for item: ${item.data.system.slug}`);
            continue;
        }
        const transformed = await TRANSFORMERS[collection](item.data, reference.data);
        await fs.writeFile(item.path, JSON.stringify(transformed, null, 2), "utf-8");
    }
}

const translateEquipment = (_reference, item) => {
    const base = {
        name: item.system.slug,
        description: "",
        agora: "",
    };

    if (item.effects.length) {
        base.effects = item.effects.reduce((acc, effect) => {
            acc[effect._id] = {
                name: item.system.slug,
                notes: "",
            };

            return acc;
        }, {});
    }

    return base;
}

const translateState = (reference, _item) => {
    return {
        name: reference.name,
        description: reference.system.description,
    };
}

const TRANSLATION_FNS = {
    weapons: translateEquipment,
    armors: translateEquipment,
    equipment: translateEquipment,
    states: translateState,
};

const generateTranslations = async (collection) => {
    console.log(`Generating translations for collection: ${collection}...`);
    const collectionPath = path.join(SOURCE_DIR, "items", collection);

    const items = await fs.readdir(collectionPath)
        .then(files => Promise.all(
            files.map(file => fs.readFile(path.join(collectionPath, file), "utf-8")
                .then(data => JSON.parse(data))
            )
        ));

    const references = await fs.readdir(path.join(REF_DIR, collection))
        .then(files => Promise.all(
            files.map(file => fs.readFile(path.join(REF_DIR, collection, file), "utf-8")
                .then(data => JSON.parse(data))
            )
        ));

    const translations = {
        label: collection,
        entries: {},
    };

    for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
        let reference = references.find(ref => ref.system?.id === item.system.slug);
        if (!reference && item.system) {
            console.warn(`No reference found for item: ${item.system?.slug}`);
            reference = {
                name: item.name,
            }
        }

        if (item.system) {
            console.log(`Generating translation for item: ${item.system.slug}`);
            translations.entries[item.system.slug] = TRANSLATION_FNS[collection](reference, item);
        } else {
            console.warn(`Skipping Folder item: ${item.name}`);
        }
    }

    console.log(translations);

    await fs.writeFile(path.join(REF_DIR, "_i18n", `fading-suns-4.${collection}.json`), JSON.stringify(translations, null, 2), "utf-8");
}

const linkSlugs = async (collection, property) => {
    console.log(`Linking slugs in collection: ${collection}...`);
    const collectionPath = path.join(SOURCE_DIR, "items", collection);

    const idRegistry = await fs.readFile(path.join(SOURCE_DIR, "ids.csv"), "utf-8")
        .then(data => {
            const lines = data.split("\n").filter(line => line.trim().length > 0);
            const registry = {};

            for (const line of lines) {
                const [id, type] = line.split(",").map(part => part.trim());
                registry[id] = type;
            }

            return registry;
        });

    const items = await fs.readdir(collectionPath)
        .then(files => Promise.all(
            files.map(file => fs.readFile(path.join(collectionPath, file), "utf-8")
                .then(data => ({
                    data: JSON.parse(data),
                    path: path.join(collectionPath, file),
                }))
            )
        ));

    for (const item of items) {
        const transformed = {
            ...item.data,
            system: {
                ...item.data.system,
                [property]: item.data.system[property].map(group => {
                    if (group.length === 0) {
                        return null;
                    }

                    return group.map(condition => {
                        const type = idRegistry[condition.slug];
                        if (!type) {
                            console.warn(`No registry entry found for slug: ${condition.slug}`);
                            return {
                                type: "special",
                                slug: condition.slug,
                                value: condition.value,
                            };
                        }

                        return {
                            type,
                            slug: condition.slug,
                            value: condition.value,
                        };
                    });
                }).filter(Boolean),
            },
        };

        await fs.writeFile(item.path, JSON.stringify(transformed, null, 2), "utf-8");
    }
}

const IMG_MAPPING = {
    armor: "icons/equipment/chest/breastplate-banded-blue.webp",
    weapon: "icons/weapons/swords/swords-short.webp",
    shield: "icons/armor/shields/shield-round-brown-steel.webp",
    maneuver: "icons/magic/symbols/cog-orange-red.webp",
    equipmentFeature: "icons/commodities/tech/blueprint.webp",
    power: "icons/magic/control/buff-flight-wings-runes-red-yellow.webp",
};

const DEFAULT_SYSTEM = {
    armor: {
        tl: 5,
        techCompulsion: null,
        res: 0,
        eshieldCompatibility: "es",
        cost: 0,
        anti: [],
        features: [],
        curio: false,
        agora: "",
        quality: "standard",
        size: "none",
        capability: null,
    },
    weapon: {
        curio: false,
        agora: "",
        quality: "standard",
        size: "none",
        features: [],
        cost: 0,
        tl: 5,
        capability: null,
        damage: 0,
        strRequirement: 0,
        melee: false,
        range: {
            short: 0,
            long: 0,
        },
        rof: 1,
        burst: false,
        ammo: 0,
        currentAmmo: 0,
        blastForce: null,
        damageTypes: [],
        techCompulsion: null,
    },
    melee: {
        tl: 5,
        damage: 0,
        strRequirement: 0,
        size: "none",
        cost: 0,
        features: [],
        capability: null,
        agora: "",
        curio: false,
        quality: "standard",
        melee: true,
        range: {},
        rof: 1,
        burst: false,
        ammo: 0,
        currentAmmo: 0,
        damageTypes: [],
    },
    equipment: {
        curio: false,
        agora: "",
        quality: "standard",
        size: "none",
        cost: 0,
        tl: 5,
        techCompulsion: undefined,
    },
    maneuver: {
        type: "action",
        skill: "",
        characteristic: "",
        goalModifier: "none",
        actionType: [
            "primary",
        ],
        playScale: "instantaneous",
        noVp: false,
    },
    state: {
        type: "TODO",
    },
    weaponFeature: {
    },
    psiPower: {
        cost: 1,
        additionalCost: "",
        path: "Psyche",
        characteristic: "",
        skill: "",
        discipline: "psi",
        components: [],
        level: 1,
        preconditions: [
            {
                type: "power",
                slug: "",
            }
        ],
        elementary: false,
        resistance: "",
        incidence: "",
    }
};

const BASE_EFFECT_SYSTEM = {
    valueType: "constant",
    targetType: "goal",
    austerity: false,
    context: "none",
    value: "0",
    notes: ""
};

const BASE_ARMOR_EFFECT_SYSTEM = {
    ...BASE_EFFECT_SYSTEM,
    targetType: "skill",
    target: "vigor",
    value: "-1"
};

const BASE_EFFECT = {
    disabled: false,
    img: null,
    type: "base",
    changes: [],
    duration: {
        startTime: null,
        combat: null
    },
    description: "",
    origin: null,
    tint: "#ffffff",
    transfer: true,
    statuses: [],
    flags: {},
    _stats: {
        compendiumSource: null,
        duplicateSource: null,
        exportSource: null,
        coreVersion: "13.350",
        systemId: "fading-suns-4",
        systemVersion: "PLACEHOLDER",
        lastModifiedBy: null
    },
}

const EFFECT_TEMPLATE_FNS = {
    melee: (slug, id, index, effectID = randomID()) => ({
        ...BASE_EFFECT,
        name: slug,
        _id: effectID,
        system: {
            ...BASE_EFFECT_SYSTEM,
            context: "melee",
        },
        sort: index,
        _key: `!items.effects!${id}.${effectID}`
    }),
    armor: (slug, id, index, effectID = randomID()) => ({
        ...BASE_EFFECT,
        name: slug,
        _id: effectID,
        system: {
            ...BASE_ARMOR_EFFECT_SYSTEM,
        },
        sort: index,
        _key: `!items.effects!${id}.${effectID}`
    }),
    equipment: (slug, id, index, effectID = randomID()) => ({
        ...BASE_EFFECT,
        name: slug,
        _id: effectID,
        system: {
            ...BASE_EFFECT_SYSTEM,
        },
        sort: index,
        _key: `!items.effects!${id}.${effectID}`
    }),
    state: (slug, id, index, effectID = randomID()) => ({
        ...BASE_EFFECT,
        name: slug,
        _id: effectID,
        system: {
            ...BASE_EFFECT_SYSTEM,
        },
        sort: index,
        _key: `!items.effects!${id}.${effectID}`
    }),
    psiPower: (slug, id, index, effectID = randomID()) => ({
        ...BASE_EFFECT,
        name: slug,
        _id: effectID,
        system: {
            ...BASE_EFFECT_SYSTEM,
        },
        sort: index,
        _key: `!items.effects!${id}.${effectID}`
    }),
};

const TRANSLATION_ENTRY_TEMPLATE = {
    weapon: {
        name: "",
        description: "",
        agora: "",
    },
    armor: {
        name: "",
        description: "",
        agora: "",
    },
    equipment: {
        name: "",
        description: "",
        agora: "",
    },
    maneuver: {
        name: "",
        description: "",
        additionalTimeInformation: "",
        impact: "",
        resistance: "",
        capability: "",
    },
    state: {
        name: "",
        description: "",
    },
    equipmentFeature: {
        name: "",
        description: "",
    },
    power: {
        name: "",
        description: "",
        additionalCost: "",
        path: "",
        resistance: "",
        incidence: "",
    }
};

const createSourceItem = async (template, slug, effects = 0) => {
    const pack = TEMPLATE_PACK_MAPPING[template];
    const type = TEMPLATE_TYPE_MAPPING[template] || template;
    if (!type) {
        console.error(`Unknown pack type: ${pack}`);
        return;
    }
    console.log(`Creating new source item of type: ${type} with slug: ${slug}...`);
    const collectionPath = path.join(SOURCE_DIR, "items", pack);
    const id = randomID();

    const newItem = {
        type,
        name: slug,
        folder: null,
        system: {
            slug,
            description: "",
            ...DEFAULT_SYSTEM[template],
        },
        _id: id,
        img: IMG_MAPPING[type] || "icons/svg/item-bag.svg",
        effects: Array.from({ length: effects }, (_, i) =>
            EFFECT_TEMPLATE_FNS[template](slug, id, i)
        ),
        flags: {},
        _stats: {
            compendiumSource: null,
            duplicateSource: null,
            exportSource: null,
            coreVersion: "13.350",
            systemId: "fading-suns-4",
            systemVersion: "0.0.1",
            createdTime: 1760897547556,
            modifiedTime: 1760897547556,
            lastModifiedBy: "ef54fWvGiyPGgegN"
        },
        ownership: {
            default: 0,
            ef54fWvGiyPGgegN: 3
        },
        sort: 0,
        _key: `!items!${id}`,
    };

    const translationFile = path.join(BABELE_COMPENDIUM_FOLDER, `fading-suns-4.${pack}.json`);
    const translations = await fs.readFile(translationFile, "utf-8")
        .then(data => JSON.parse(data))

    translations.entries[slug] = TRANSLATION_ENTRY_TEMPLATE[type];

    if (effects > 0) {
        translations.entries[slug].effects = {};
        newItem.effects.forEach((effect) => {
            translations.entries[slug].effects[effect._id] = {
                name: slug,
                notes: "",
            };
        });
    }

    const sortedEntries = Object.keys(translations.entries).sort().reduce((acc, key) => {
        acc[key] = translations.entries[key];
        return acc;
    }, {});

    await fs.writeFile(translationFile, JSON.stringify({ ...translations, entries: sortedEntries }, null, 2), "utf-8");

    console.log(`Updated translations at: ${translationFile}: `, translations.entries[slug]);
    await fs.writeFile(path.join(collectionPath, `${slug}_${id}.json`), JSON.stringify(newItem, null, 2), "utf-8");

    console.log(`Created new item at: ${path.join(collectionPath, `${slug}_${id}.json`)}`);
}

const addModifierToState = async (slug) => {
    const statesPath = path.join(SOURCE_DIR, "items", "states");
    const translationFile = path.join(BABELE_COMPENDIUM_FOLDER, `fading-suns-4.states.json`);
    const translations = await fs.readFile(translationFile, "utf-8")
        .then(data => JSON.parse(data));

    const files = await fs.readdir(statesPath)
    const file = files.find(file => file.startsWith(slug));
    const data = await fs.readFile(path.join(statesPath, file), "utf-8");
    const state = JSON.parse(data);
    const effectID = randomID();
    const effect = {
        ...BASE_EFFECT,
        name: state.system.slug,
        type: "modifier",
        _id: effectID,
        img: state.img,
        system: {
            ...BASE_EFFECT_SYSTEM,
        },
        statuses: [],
        sort: state.effects.length,
        _key: `!items.effects!${state._id}.${effectID}`
    }

    state.effects = [
        ...state.effects,
        effect
    ];

    await fs.writeFile(
        path.join(statesPath, file),
        JSON.stringify(state, null, 2),
        "utf-8"
    );

    translations.entries[slug].effects = {
        ...translations.entries[slug].effects,
        [effectID]: {
            name: state.system.slug,
            notes: "",
        }
    };

    await fs.writeFile(translationFile, JSON.stringify(translations, null, 2), "utf-8");

    console.log(`Added modifier effect to state: ${slug}`);
}

const cmd = new Command();

cmd.name("packs")
    .description("Manage system packs")

cmd
    .command("compile")
    .description("Compile system packs")
    .action(compile);

cmd
    .command("extract")
    .description("Extract system packs")
    .action(extract);

cmd
    .command("import <type>")
    .description("Transform and import reference data of given type")
    .action(importReference);

cmd
    .command("link-slugs <type> <property>")
    .description("Link slugs to their types in given collection and property")
    .action(linkSlugs);

cmd
    .command("translate <collection>")
    .description("Generate translations for the given collection")
    .action(generateTranslations);

cmd
    .command("create <pack> <slug> [effectsAmount]")
    .description("Create a new item in the given pack with the specified slug")
    .action(createSourceItem);

cmd
    .command("add-mod-to-state <slug>")
    .description("Add a modifier effect to the specified state")
    .action(addModifierToState);

cmd.parseAsync();
