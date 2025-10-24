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
