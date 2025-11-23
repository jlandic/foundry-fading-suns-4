import BaseActor from "../documents/base-actor.mjs";

export const combatTurnChange = async (
    {
        current: { combatantId },
        previous: { combatantId: previousCombatantId },
    },
) => {
    if (combatantId) {
        const combatant = game.combats.active?.combatants?.get(combatantId);
        if (combatant?.token?.actorLink) {
            await combatant.actor?.turnStartTick();
        } else if (combatant?.token) {
            await BaseActor.turnStartTick(combatant.token);
        }
    }

    if (previousCombatantId) {
        const combatant = game.combats.active?.combatants?.get(previousCombatantId);
        if (combatant?.token?.actorLink) {
            await combatant.actor?.turnEndTick();
        } else if (combatant?.token) {
            await BaseActor.turnEndTick(combatant.token);
        }
    }
};
