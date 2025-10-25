import { None, SPECIAL_REFERENCE_PREFIX } from "../system/references.mjs";
import { enrichHTML } from "../utils/text-editor.mjs";

export const BaseSheetMixin = Base => class extends Base {
    async _prepareReference(path, type) {
        const slug = foundry.utils.getProperty(this.document, path);

        if (!slug || slug === "") {
            return "";
        }

        if (slug.startsWith(SPECIAL_REFERENCE_PREFIX)) {
            const text = game.i18n.localize(`fs4.${type}.special.${slug}`);
            return await enrichHTML(`<em>${text}</em>`);
        }

        return await enrichHTML(`@SLUG[${type}:${slug}]`);
    }

    async _prepareReferenceLink(path, type) {
        const slug = foundry.utils.getProperty(this.document, path);

        if (!slug || slug === "") {
            return null;
        }

        const item = await globalThis.registry.fromSlugAsync(slug, type);
        if (!item) {
            return null;
        }

        return {
            slug,
            type,
            name: path,
            label: item.name,
            uuid: item.uuid,
            img: item.img,
        };
    }

    _prepareSelectOptions(options, selectedValue, i18nPrefix, params = { includeNone: false, sort: false }) {
        const preparedOptions = options.map(option => ({
            label: game.i18n.localize(`${i18nPrefix}.${option}`),
            value: option,
            selected: option === selectedValue,
        }));

        if (params.includeNone) {
            preparedOptions.unshift({
                label: game.i18n.localize("fs4.common.none"),
                value: None,
                selected: selectedValue === None,
            });
        }

        return preparedOptions;
    }
}
