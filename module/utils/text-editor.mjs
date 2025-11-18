export const enrichHTML = async (html, options) => {
    if (!html) return "";

    let text = html.replace(
        /@SLUG\[([^:\s]+?):([^\]]+?)\]/g,
        (_capture, type, slug) => {
            const uuid = globalThis.fs4.registry.uuidFromSlug(slug, type);

            if (uuid) return `@UUID[${uuid}]`;

            return `<em>${game.i18n.format("fs4.sheets.missingReference", { type: game.i18n.localize(`TYPES.Item.${type}`), slug })}</em>`;
        },
    );
    text = await foundry.applications.ux.TextEditor.implementation.enrichHTML(text, options);
    return text.replaceAll(
        /data-tooltip=".+?"/g,
        ""
    ).replaceAll(
        /data-tooltip-text=".+?"/g,
        ""
    );
}
