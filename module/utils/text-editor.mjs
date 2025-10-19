export const enrichHTML = async (html, options) => {
    let text = html.replaceAll(
        /@SLUG\[([a-z\d_]+)\]/g,
        (_capture, slug) => `@UUID[${globalThis.registry.uuidFromSlug(slug)}]`,
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
