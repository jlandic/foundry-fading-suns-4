import { Characteristics } from "../../system/references.mjs";

const fields = foundry.applications.fields;

export const selectCharacteristic = () => {
    const selectCharacteristicInput = fields.createSelectInput({
        options: Object.values(Characteristics).map((characteristic) => ({
            value: characteristic,
            label: game.i18n.localize(`fs4.characteristics.${characteristic}`),
        })).sort((a, b) => a.label.localeCompare(b.label)),
        name: "characteristic",
    });

    const selectGroup = fields.createFormGroup({
        input: selectCharacteristicInput,
        label: game.i18n.localize("fs4.dialogs.selectCharacteristic.label"),
    });

    const selectCharacteristicDialogContent = selectGroup.outerHTML;

    return foundry.applications.api.DialogV2.input({
        window: { title: game.i18n.localize("fs4.dialogs.selectCharacteristic.label") },
        content: selectCharacteristicDialogContent,
        ok: {
            label: game.i18n.localize("fs4.dialogs.common.buttons.ok"),
        },
    });
}
