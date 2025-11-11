export const createStatusEffects = async () => {
    const states = await globalThis.registry.getAllOfType("state");
    CONFIG.statusEffects = states
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(state => ({
            id: state.system.slug,
            label: state.name,
            img: state.img,
            _id: state.id,
        }));
}
