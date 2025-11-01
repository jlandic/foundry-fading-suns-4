export default class BaseActor extends foundry.documents.Actor {
    async update(data, options = {}) {
        const newSpeciesSlug = data["system.species"];

        if (newSpeciesSlug === null) {
            data["system.size"] = this.system.schema.fields.size.initial;
            data["system.speed"] = {
                twoLegs: this.system.schema.fields.speed.fields.twoLegs.initial,
                fourLegs: this.system.schema.fields.speed.fields.fourLegs.initial,
                sixLegs: this.system.schema.fields.speed.fields.sixLegs.initial,
            };
        } else if (newSpeciesSlug) {
            const species = await globalThis.registry.fromSlugAsync(newSpeciesSlug, "species");

            if (species) {
                data["system.size"] = species.system.size;
                data["system.speed"] = species.system.speed;
            }
        }

        if (data.system?.wp && data.system.wp + this.system.vp.bank > this.system.maxBank) {
            data.system.vp.bank = this.system.maxBank - this.system.wp - data.system.wp;
        }

        return super.update(data, options);
    }

    async addNewModifier() {
        return await this.createEmbeddedDocuments("ActiveEffect", [
            {
                name: game.i18n.localize("fs4.modifier.defaultName"),
                disabled: false,
            }
        ]);
    }

    async toggleModifier(id) {
        const effect = this.effects.get(id);
        if (!effect) return;

        return await effect.update({ disabled: !effect.disabled });
    }

    async removeModifier(modifierId) {
        return await this.deleteEmbeddedDocuments("ActiveEffect", [modifierId]);
    }

    get resistance() {
        if (this.system.resistance) {
            return this.system.resistance;
        }

        // TODO: calculate total Resistance from modifiers
        return {
            body: 0,
            mind: 0,
            spirit: 0,
        }
    }

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
        await this.bankVP();
        await this.update({ "system.vp.cache": 0 });
    }

    async addReference(property, slug) {
        await this.update({ [property]: slug });
    }

    async removeReference(property) {
        await this.update({ [property]: null });
    }

    async surge() {
        if (!this.system.hasSurges) return false;
        if (this.system.surges === 0) return false;

        await this.update({
            "system.surges": this.system.surges - 1,
            "system.vp.cache": this.system.vp.cache + this.system.surgeVPGain
        });

        return true;
    }

    async revival() {
        if (!this.system.hasRevivals) return false;
        if (this.system.revivals === 0) return false;

        await this.update({
            "system.revivals": this.system.revivals - 1,
            "system.currentVitality": Math.min(this.system.currentVitality + this.system.revivalVitalityGain, this.system.maxVitality),
        });
    }

    async respite() {
        const updates = {
            "system.currentVitality": Math.min(this.system.currentVitality + 1, this.system.maxVitality),
        };

        if (this.system.hasSurges) {
            updates["system.surges"] = this.system.maxSurges;
        }

        if (this.system.hasRevivals) {
            updates["system.revivals"] = this.system.maxRevivals;
        }

        await this.update(updates);

        // TODO: if Fatigued, remove Fatigued
        // TODO: roll Vigor + Endurance against Effortless Resistance to gain VP to add to vitality
    }
}
