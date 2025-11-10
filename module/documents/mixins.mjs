export const WithModifiersMixin = Base => class extends Base {
    get allModifiers() {
        return this.effects.map(e => e).concat(this.embeddedModifiers);
    }

    async addNewModifier() {
        return await this.createEmbeddedDocuments("ActiveEffect", [
            {
                name: this.name,
                disabled: false,
                type: "modifier",
            }
        ]);
    }

    async toggleModifier(id) {
        let effect = this.effects.get(id);
        if (!effect) {
            effect = this.embeddedModifiers.find(e => e.id === id);
        }
        if (!effect) return;

        return await effect.update({ disabled: !effect.disabled });
    }

    async removeModifier(modifierId) {
        return await this.deleteEmbeddedDocuments("ActiveEffect", [modifierId]);
    }
}
