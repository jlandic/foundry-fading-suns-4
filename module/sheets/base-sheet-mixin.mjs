import { DamageTypes, None, SPECIAL_REFERENCE_PREFIX } from "../system/references.mjs";
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
            selected: selectedValue instanceof Array ? selectedValue.includes(option) : option === selectedValue,
        })).sort((a, b) => {
            if (params.sort) {
                return a.label.localeCompare(b.label);
            }
            return 0;
        });

        if (params.includeNone) {
            preparedOptions.unshift({
                label: game.i18n.localize("fs4.common.none"),
                value: None,
                selected: selectedValue === None,
            });
        }

        return preparedOptions;
    }

    _prepareModifiers() {
        if (!this.includeModifiers) return [];

        // Include feature modifiers for Items, unless they're embedded in an actor,
        // lest we duplicate the feature modifiers copied when adding the item to the actor.
        const modifiers = this.document.featureModifiers && !this.document.parent
            ? this.document.allModifiers.concat(this.document.featureModifiers)
            : this.document.allModifiers;

        return modifiers.map((modifier) => ({
            id: modifier.id,
            label: `${modifier.humanReadable} (${modifier.name})`,
            parentId: modifier.parent?.id || null,
            controls: [
                {
                    icon: modifier.disabled ? "square" : "check-square",
                    i18nKey: "fs4.sheets.common.toggle",
                    action: "toggleModifier",
                    requiresEdit: true,
                },
                modifier.parent.id === this.document.id ||
                    // Modifiers embedded in items (equipment features) are not editable
                    // since they belong to non-copied references.
                    (this.document.items || []).map(i => i.id).includes(modifier.parent.id)
                    ? {
                        icon: "edit",
                        i18nKey: "fs4.sheets.common.edit",
                        action: "editModifier",
                        requiresEdit: true,
                    }
                    : null,
                modifier.parent.id !== this.document.id ? null : {
                    icon: "trash",
                    i18nKey: "fs4.sheets.common.delete",
                    action: "removeModifier",
                    requiresEdit: true,
                }
            ].filter(Boolean),
            details: [
                {
                    label: game.i18n.localize("fs4.modifier.fields.notes"),
                    value: modifier.system.notes || "",
                }
            ]
        }));
    }

    _prepareDamageTypeOptions(selectedTypes) {
        return Object.values(DamageTypes).map((type) => ({
            label: game.i18n.localize(`fs4.damageTypes.short.${type}`),
            title: game.i18n.localize(`fs4.damageTypes.${type}`),
            type,
            checked: selectedTypes.includes(type),
        }));
    }

    static async _addModifier(event) {
        event.preventDefault();

        await this.document.addNewModifier();
    }

    static async _editModifier(event, target) {
        event.preventDefault();

        if (target.dataset.parentId) {
            const item = this.document.items?.find(i => i.id === target.dataset.parentId);
            if (item) {
                const effect = item.effects.get(target.dataset.id);
                if (effect) {
                    return effect.sheet.render(true);
                }
            }
        }

        this.document.effects.get(target.dataset.id)?.sheet?.render(true);
    }

    static async _toggleModifier(event, target) {
        event.preventDefault();

        await this.document.toggleModifier(target.dataset.id, target.dataset.origin);
    }

    static async _removeModifier(event, target) {
        event.preventDefault();

        await this.document.removeModifier(target.dataset.id, target.dataset.origin);
    }
};
