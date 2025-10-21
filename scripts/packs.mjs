import path from "path";
import fs from "fs/promises";
import { Command } from "commander";
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";

const IDS = "references/ids.csv";
const SOURCE_DIR = "source";
const DB_DIR = "dist/packs";
const REF_DIR = "references";
const PACKS = [
    "items/afflictions",
    "items/blessings",
    // "items/callings",
    "items/capabilities",
    "items/classes",
    "items/curses",
    "items/factions",
    "items/perks",
    "items/species",
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

const transformCapability = async (original, reference) => {
    return {
        ...original,
        name: reference.name,
        system: {
            ...original.system,
            description: reference.system.description,
            type: reference.system.type,
            category: reference.system.category,
            preconditions: [
                reference.system.preconditions.map((slug) => {
                    const type = TYPE_MAPPING[slug];

                    if (!type) {
                        console.warn(`No type mapping found for slug: ${slug}`);
                        return {
                            type: "TODO",
                            slug,
                        }
                    } else {
                        return {
                            type,
                            slug,
                        }
                    }
                }),
            ],
        },
    };
}

const TRANSFORMERS = {
    capabilities: transformCapability,
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

const translateCurseBlessing = () => ({
    name: "",
    description: "",
});

const TRANSLATION_FNS = {
    curses: translateCurseBlessing,
    blessings: translateCurseBlessing,
}

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
