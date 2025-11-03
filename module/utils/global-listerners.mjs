export const initializeChatListeners = () => {
    const chatLogs = document.querySelectorAll(".chat-log");
    chatLogs.forEach((chatLog) => {
        chatLog.addEventListener("click", async (event) => {
            const button = event.target.closest("button.gain-vp");
            if (!button) return;

            const {
                actorId,
                vp,
            } = event.target.dataset;

            const actor = game.actors.get(actorId);

            if (!actor?.isOwner) {
                ui.notifications.warn(game.i18n.localize("fs4.notifications.warn.cantStealVp"));
                return;
            }

            await actor.gainVP(Number(vp));

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
