import path from "path";
import fs from "fs/promises";
import { Command } from "commander";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";
import { type } from "os";

const IDS = "source/ids.csv";
const SOURCE_DIR = "source";
const DB_DIR = "dist/packs";
const REF_DIR = "references";
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
];

const TYPE_MAPPING = {}

const initializeTypeMapping = async () => {
    const data = await fs.readFile(IDS, "utf-8");
    const lines = data.split("\n").filter(line => line.trim().length > 0);

    for (const line of lines) {
        const [id, type] = line.split(",").map(part => part.trim());
        TYPE_MAPPING[id] = type;
    }
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
        await extractPack(dbPath, sourcePath, { yaml: false, clean: false, log: true });

        console.log(`Extracted pack: ${pack}`);
    }

    console.log("All packs extracted.");
}

const transformCalling = async (original, reference) => {
    return {
        ...original,
        name: original.system.slug,
        system: {
            ...original.system,
            capabilities: reference.system.capabilities.map((caps) => caps.split(" ou ").map(cap => cap.trim())),
            perks: reference.system.perks,
            characteristics: reference.system.characteristics.map((group) => {
                return group.map((char) => {
                    return {
                        slug: char.name,
                        value: char.value,
                    };
                });
            }),
            skills: reference.system.skills.map((group) => {
                return group.map((skill) => {
                    return {
                        slug: skill.name,
                        value: skill.value,
                    };
                });
            }),
            preconditions: [
                reference.system.class === "open" ? [] : [{
                    type: "class",
                    slug: reference.system.class,
                }],
            ].filter(group => group.length > 0),
        },
    };
}

const GOAL_MODIFIER_MAPPING = {
    "no": "none",
    "melee": "melee_weapon",
    "ranged": "ranged_weapon",
};

const actionTypeMapping = (time) => {
    if (time.match(/[aA]ctions?\sprincipale\s(?:réflexe\s)?(?:et|\+)\s(?:action\s)?de\smouvement/)) {
        return [
            "primary",
            "movement",
        ];
    }
    if (time.match(/action\sprincipale\sréflexe/)) {
        return ["reflexive_primary"];
    }
    if (time.match(/action\sprincipale/)) {
        return ["primary"];
    }
    if (time.match(/action\secondaire\sréflexe/)) {
        return ["reflexive_secondary"];
    }
    if (time.match(/action\secondaire/)) {
        return ["secondary"];
    }
    if (time.match(/mouvement/)) {
        return ["movement"];
    }
    if (time.match(/action\sréflexe/)) {
        return ["reflexive_secondary"];
    }

    return [];
}

const playScaleMapping = (time) => {
    if (time.match(/^<p>Narratif/)) {
        return "narrated";
    }
    if (time.match(/^<p>Instant/)) {
        return "instantaneous";
    }
    if (time.match(/^<p>Temps\sprésent/)) {
        return "present_tense";
    }

    throw new Error(`Unknown play scale for time: ${time}`);
}

const transformManeuver = async (original, reference) => {
    return {
        ...original,
        name: original.system.slug,
        img: "icons/magic/symbols/cog-orange-red.webp",
        system: {
            slug: reference.system.id,
            type: reference.system.type,
            skill: reference.system.skill,
            characteristic: reference.system.characteristic,
            goalModifier: GOAL_MODIFIER_MAPPING[reference.system.addWeaponToRoll] || "none",
            actionType: actionTypeMapping(reference.system.time),
            playScale: playScaleMapping(reference.system.time),
            noVP: reference.system.time.includes("aucun PV"),
        },
    };
}

const transformFactions = async (original, reference) => {
    return {
        ...original,
        system: {
            ...original.system,
            capabilities: reference.system.capabilities.map((caps) => caps.split(" ou ").map(cap => cap.trim())),
        }
    }
}

const TRANSFORMERS = {
    callings: transformCalling,
    maneuvers: transformManeuver,
    factions: transformFactions,
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

const translateCapability = (reference, item) => ({
    name: reference.name || "MISSING NAME",
    description: reference.system.description || "MISSING DESCRIPTION",
});

const translateCalling = (reference, item) => ({
    name: reference.name || "MISSING NAME",
    description: reference.system.description || "MISSING DESCRIPTION",
    patrons: reference.system.patrons || "MISSING PATRONS",
});

const translateManeuver = (reference, item) => ({
    name: reference.name || "MISSING NAME",
    description: reference.system.description.replace(/^(<p>)?([a-z])/, (_cap, p, char) => `${p || ""}${char.toUpperCase()}`) || "MISSING DESCRIPTION",
    additionalTimeInformation: reference.system.time
        .replace("<p>Instantané (action principale)</p>", "")
        .replace("<p>Narratif.</p>", "")
        .replace(/<p>Narratif.?\s/, "<p>")
        .replace("<p>Instantané (action principale réflexe)</p>", "")
        .replace("<p>Instantané (action secondaire réflexe ; aucun PV)</p>", "<p>Aucun PV.</p>")
        .replace("<p>Narratif (minimum une semaine)</p>", "<p>Minimum une semaine</p>")
        .replace("<p>Temps présent</p>", "")
        .replace("<p>Instantané (actions principale et de mouvement)</p>", "")
        .replace("<p>Temps présent (Action principale)</p>", "")
        .replace("<p>Temps présent .</p>", "")
        .replace("<p>Temps présent (un jet par semaine)</p>", "<p>Un jet par semaine</p>")
        .replace("<p>Instantané (action réflexe)</p>", "")
        .replace("<p>Instantané (action secondaire ; aucun PV)</p>", "<p>Aucun PV.</p>")
        .replace("<p>Instant. Action principale.</p>", "")
        .replace(/<p>Temps\sprésent\s\(([^\)]+)\)<\/p>/, (_cap, text) => `<p>${text}</p>`)
        .replace(/^(<p>)?([a-z])/, (_cap, p, char) => `${p || ""}${char.toUpperCase()}`),
    impact: reference.system.impact.replace(
        /@UUID\[[^\]]+\](\{[^\}]+\})?/g,
        (_cap, name) => {
            if (name) {
                return `@SLUG[TODO]{${name}}`;
            } else {
                return `@SLUG[TODO]`;
            }
        }
    ).replace(/^(<p>)?([a-z])/, (_cap, p, char) => `${p || ""}${char.toUpperCase()}`),
    resistance: reference.system.resistance.replace(/^(<p>)?([a-z])/, (_cap, p, char) => `${p || ""}${char.toUpperCase()}`),
    capability: reference.system.capability.replace(
        /@UUID\[[^\]]+\](\{[^\}]+\})?/g,
        (_cap, name) => {
            if (name) {
                return `@SLUG[TODO]{${name}}`;
            } else {
                return `@SLUG[TODO]`;
            }
        }
    ).replace("<p>N/A</p>", "").replace(/^(<p>)?([a-z])/, (_cap, p, char) => `${p || ""}${char.toUpperCase()}`),
});

const TRANSLATION_FNS = {
    capabilities: translateCapability,
    callings: translateCalling,
    maneuvers: translateManeuver,
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
        if (!reference) {
            console.warn(`No reference found for item: ${item.system.slug}`);
            reference = {
                name: item.name,
            }
        }

        translations.entries[item.system.slug] = TRANSLATION_FNS[collection](reference, item);
    }

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

cmd.parseAsync();
