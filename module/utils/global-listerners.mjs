export const initializeChatListeners = () => {
    const chatLogs = document.querySelectorAll(".chat-log");
    chatLogs.forEach((chatLog) => {
        chatLog.addEventListener("click", async (event) => {
            console.log("Chat log clicked", event);
            const button = event.target.closest("button.gain-vp");
            if (!button) return;

            console.log("Gain VP button clicked", button);

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
        });
    });
}
