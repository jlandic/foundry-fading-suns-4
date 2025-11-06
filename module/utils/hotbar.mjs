import { RollTypes } from "../system/rolls.mjs";

const HOTBAR_MACROS_FOLDER = "Hotbar";

export const onHotbarDrop = async (_hotbar, data, slot) => {
    const {
        type,
        itemId,
        actorId,
    } = data;

    const actor = Actor.get(actorId);

    let rootFolder = game.folders.find((folder) => folder.name === HOTBAR_MACROS_FOLDER && folder.type === "Macro");
    if (rootFolder == null) {
        rootFolder = await Folder.create({
            name: HOTBAR_MACROS_FOLDER,
            type: "Macro",
        });
    }
    let folder = game.folders.find((folder) => folder.name === game.user.name);
    if (folder == null) {
        folder = await Folder.create({
            name: game.user.name,
            type: "Macro",
            folder: rootFolder,
        });
    }

    let command = "";
    let name = null;
    let item = null;
    if (type === RollTypes.Maneuver) {
        item = actor.items.get(itemId);
        name = new Handlebars.SafeString(item.name);
        command = `Actor.get("${actorId}")?.rollManeuver("${itemId}")`;
    } else if (type === RollTypes.Skill) {
        name = game.i18n.localize(`fs4.skills.${itemId}`);
        command = `Actor.get("${actorId}")?.rollSkill("${itemId}")`;
    }

    if (command === "") return;

    const macro = game.macros.find(m => m.name === name && m.command === command) ??
        (await Macro.create({
            type: "script",
            name,
            command,
            folder: folder.id,
            img: item?.img,
        })) ?? null;

    if (macro == null) return;

    await game.user.assignHotbarMacro(macro, slot);
}
