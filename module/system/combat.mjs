export const combatTurnChange = async (
    {
        current: { combatantId },
        previous: { combatantId: previousCombatantId },
    },
) => {
    if (combatantId) {
        const actor = game.combats.active?.combatants?.get(combatantId)?.actor;
        await actor?.turnStartTick();
    }

    if (previousCombatantId) {
        const actor = game.combats.active?.combatants?.get(previousCombatantId)?.actor;
        await actor?.turnEndTick();
    }
};
