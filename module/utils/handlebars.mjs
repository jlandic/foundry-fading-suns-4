const PARTIALS = [
    // Item partials
    "item/partials/choices-set.hbs",

    // Shared partials
    "shared/description.hbs",
    "shared/editor.hbs",
];

export async function preloadTemplates() {
    const paths = PARTIALS.reduce((acc, path) => {
        acc[path.replace(".hbs", ".html")] = `systems/fading-suns-4/templates/${path}`;
        acc[`fading-suns-4.${path.split("/").pop().replace(".hbs", "")}`] = `systems/fading-suns-4/templates/${path}`;
        return acc;
    }, {});

    await foundry.applications.handlebars.loadTemplates(paths);
}
