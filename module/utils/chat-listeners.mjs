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

    const {
        messageId
    } = event.target.closest("li.chat-message").dataset;

    const message = game.messages.get(messageId);
    const updatedContent = message.content.replace(/<button class="gain-vp"[\s\S]*?<\/button>/m, '');

    message.update({
        content: updatedContent,
    });
};

const gainWP = async (event) => {
    const {
        actorId,
    } = event.target.dataset;

    const actor = game.actors.get(actorId);

    if (!actor?.isOwner) {
        ui.notifications.warn(game.i18n.localize("fs4.notifications.warn.cantStealWp"));
        return;
    }

    const success = await actor.gainWP();

    if (success) {
        const {
            messageId
        } = event.target.closest("li.chat-message").dataset;

        const message = game.messages.get(messageId);
        const updatedContent = message.content.replace(/<button class="gain-wp"[\s\S]*?<\/button>/m, '');

        message.update({
            content: updatedContent,
        });
    }
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
            else if (event.target.matches("button.gain-wp")) {
                gainWP(event);
            }
        });
    });
};
