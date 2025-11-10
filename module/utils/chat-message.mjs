export const renderChatMessage = (_message, [html]) => {
    if (game.user.isGM) return;

    const secrets = html.querySelectorAll(".secret");
    secrets.forEach((secret) => {
        secret.remove();
    });
}
