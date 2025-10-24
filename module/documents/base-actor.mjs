export default class BaseActor extends foundry.documents.Actor {
    async gainVP(amount) {
        await this.update("system.vp.cache", this.system.vp.cache + amount);
    }

    async bankVP() {
        if (!this.system.hasVPBank) return;

        const bankable = this.system.bankVPCapacity - this.system.vp.bank;
        if (bankable <= 0) return;
        const toBank = Math.min(bankable, this.system.vp.cache);

        await this.update({
            "system.vp.cache": this.system.vp.cache - toBank,
            "system.vp.bank": this.system.vp.bank + toBank,
        });
    }

    async spendVP(amount) {
        if (this.system.vp.cache < amount) {
            if (!this.system.hasVPBank || this.system.vp.cache + this.system.vp.bank < amount) {
                return ui.notifications.error(game.i18n.localize("error.actor.notEnoughVP"));
            }

            const fromBank = amount - this.system.vp.cache;
            await this.update("system.vp.bank", fromBank);
            await this.update("system.vp.cache", 0);
        }
    }

    async emptyCache() {
        await this.update("system.vp.cache", 0);
    }

    async removeReference(property) {
        await this.update({ [property]: null });
    }
}
