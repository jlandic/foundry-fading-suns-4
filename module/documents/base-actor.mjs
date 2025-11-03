import { selectCharacteristic } from "../apps/dialogs/roll-dialogs.mjs";
import RollApp from "../apps/roll.mjs";
import { ModifierTargetTypes, ResistanceTypes } from "../system/references.mjs";
import { RollIntention } from "../system/rolls.mjs";

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

    async gainVP(amount) {
        await this.update({ ["system.vp.cache"]: this.system.vp.cache + amount });
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

    async rollSkill(skill) {
        const form = await selectCharacteristic();
        const characteristic = form.characteristic;

        if (!characteristic) return;

        await new RollApp(
            this,
            new RollIntention({
                skill,
                characteristic,
            }),
        ).render(true);
    }

    async rollManeuver(slug) {
        const maneuver = this.items.find(i => i.system.slug === slug);

        const rollIntention = new RollIntention({
            maneuver,
        });

        await new RollApp(
            this,
            rollIntention,
        ).render(true);
    }

    toggleEquip(itemId) {
        const item = this.items.get(itemId);
        if (!item || !item.system.isEquippable) return;

        const equipped = this.getFlag("fading-suns-4", `equipped.${itemId}`) ?? false;
        return this.setFlag("fading-suns-4", `equipped.${itemId}`, !equipped);
    }

    hasItemEquipped(itemId) {
        return this.getFlag("fading-suns-4", `equipped.${itemId}`) ?? false;
    }

    get embeddedModifiers() {
        return this.items
            .filter(i => !i.system.isEquippable || this.hasItemEquipped(i.id))
            .map(i => i.effects.map(e => e)).flat();
    }

    get allModifiers() {
        return this.effects.map(e => e).concat(this.embeddedModifiers);
    }

    get resistance() {
        if (this.system.resistance) {
            return this.system.resistance;
        }

        return {
            body: this.resistanceMod(ResistanceTypes.Body),
            mind: this.resistanceMod(ResistanceTypes.Mind),
            spirit: this.resistanceMod(ResistanceTypes.Spirit),
        }
    }

    resistanceMod(resistanceType) {
        const embedded = this.embeddedModifiers
            .filter(m => !m.disabled)
            .filter(m => m.system.targetType === ModifierTargetTypes.Resistance && m.system.target === resistanceType)
            .reduce((sum, m) => sum + Number(m.system.value), 0);

        const modifiers = this.effects
            .filter(m => !m.disabled)
            .filter(m => m.system.targetType === ModifierTargetTypes.Resistance && m.system.target === resistanceType)
            .reduce((sum, m) => sum + Number(m.system.value), 0);

        if (resistanceType === ResistanceTypes.Body) {
            const armor = this.items
                .filter(i => i.type === "armor" && this.hasItemEquipped(i.id))
                .reduce((sum, i) => sum + Number(i.system.res), 0);

            return embedded + modifiers + armor;
        }

        return embedded + modifiers;
    }
}
