export const enrichHTML = async (html, options) => {
    let text = html.replaceAll(
        /@SLUG\[([a-zA-Z]):([a-z\d_]+)\]/g,
        (_capture, type, slug) => `@UUID[${globalThis.registry.uuidFromSlug(slug, type)}]`,
    );
    text = await foundry.applications.ux.TextEditor.implementation.enrichHTML(text, options);
    return text.replaceAll(
        /data-tooltip=".+"/g,
        ""
    ).replaceAll(
        /data-tooltip-text=".+"/g,
        ""
    );
}
