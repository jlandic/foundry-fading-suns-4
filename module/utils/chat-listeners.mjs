const revealMessage = async (event) => {
    const {
        messageId
    } = event.target.closest("li.chat-message").dataset;

    const message = game.messages.get(messageId);
    if (!message) return;

    const updatedContent = message.content
        .replace("class=\"secret\"", "");

    await message.update({
        content: updatedContent,
    });
}

const gainVP = async (event) => {
    const {
        actorId,
        vp,
        respite,
    } = event.target.dataset;

    const actor = game.actors.get(actorId);

    if (!actor?.isOwner) {
        ui.notifications.warn(game.i18n.localize("fs4.notifications.warn.cantStealVp"));
        return;
    }

    if (respite === "true") {
        await actor.gainRespiteVP(Number(vp));
    } else {
        await actor.gainVP(Number(vp));
    }

    const messages = game.messages.entries().toArray();
    const [lastMessageId] = messages[messages.length - 1];
    const lastMessage = game.messages.get(lastMessageId);
    const updatedContent = lastMessage.content.replace(/<button(?:.*\n.*)+<\/button>/gm, '');

    lastMessage.update({
        content: updatedContent,
    });
};

export const initializeChatListeners = () => {
    const chatLogs = document.querySelectorAll(".chat-log");
    chatLogs.forEach((chatLog) => {
        chatLog.addEventListener("click", async (event) => {
            event.preventDefault();

            if (event.target.matches("button.reveal")) {
                revealMessage(event);
            }
            else if (event.target.matches("button.gain-vp")) {
                gainVP(event);
            }
        });
    });
};
