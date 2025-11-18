import { selectCharacteristic } from "../apps/dialogs/roll-dialogs.mjs";
import RollApp from "../apps/roll.mjs";
import { BASIC_MANEUVERS, Characteristics, ModifierTargetTypes, ResistanceTypes, ResistanceValues, Skills, TECHGNOSIS_TL_MAX } from "../system/references.mjs";
import { RollIntention } from "../system/rolls.mjs";
import { WithModifiersMixin } from "./mixins.mjs";

export default class BaseActor extends WithModifiersMixin(
    foundry.documents.Actor,
) {
    static ALLOWED_ITEM_TYPES = [
        "equipment",
        "maneuver",
        "state",
        "capability",
        "perk",
        "weapon",
        "armor",
        "handshield",
        "eshield",
        "power",
        "shield",
        "techCompulsion",
    ];

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
            const species = await globalThis.fs4.registry.fromSlugAsync(newSpeciesSlug, "species");

            if (species) {
                data["system.size"] = species.system.size;
                data["system.speed"] = species.system.speed;
            }
        }

        if (data.system?.wp && data.system.wp + this.system.vp.bank > this.system.maxBank) {
            data.system.vp.bank = this.system.maxBank - this.system.wp - data.system.wp;
        }

        if (data["system.vitality.value"] !== undefined) {
            data["system.vitality.value"] = Math.clamped(data["system.vitality.value"], 0, this.system.maxVitality);
        }

        data["system.vitality.max"] = this.system.maxVitality;

        return super.update(data, options);
    }

    async gainVP(amount) {
        await this.update({ ["system.vp.cache"]: this.system.vp.cache + amount });
    }

    async gainWP() {
        if (this.system.wp === undefined) return false;
        if (this.system.bankVPCapacity - this.system.vp.bank - this.system.wp < 0) return false;

        await this.update({ ["system.wp"]: this.system.wp + 1 });

        return true;
    }

    async gainRespiteVP(amount) {
        const newVitality = Math.min(this.system.vitality.value + Math.floor(amount / 2), this.system.maxVitality);
        await this.update({ ["system.vitality.value"]: newVitality });
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

    async addItem(item) {
        if (!BaseActor.ALLOWED_ITEM_TYPES.includes(item.type));

        const createdItems = await this.createEmbeddedDocuments("Item", [item.toObject()]);

        if (!item.featureModifiers.length) return;

        await this.items.get(createdItems[0]._id).createEmbeddedDocuments("ActiveEffect", [
            ...item.featureModifiers.map(e => e.toObject()),
        ]);
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
            "system.vitality.value": Math.min(this.system.vitality.value + this.system.revivalVitalityGain, this.system.maxVitality),
        });
    }

    async respite() {
        const updates = {
            "system.vitality.value": Math.min(this.system.vitality.value + 1, this.system.maxVitality),
        };

        if (this.system.hasSurges) {
            updates["system.surges"] = this.system.maxSurges;
        }

        if (this.system.hasRevivals) {
            updates["system.revivals"] = this.system.maxRevivals;
        }

        await this.update(updates);

        const fatigued = this.items.find(i => i.type === "state" && i.system.slug === "fatigued");
        if (fatigued) {
            await this.deleteEmbeddedDocuments("Item", [fatigued.id]);
        }

        if (updates["system.vitality.value"] === this.system.maxVitality) return;

        new RollApp(
            this,
            new RollIntention({
                characteristic: Characteristics.Endurance,
                skill: Skills.Vigor,
                resistance: ResistanceValues.Effortless,
            }),
            {
                subtitle: game.i18n.localize("fs4.apps.roll.subtitle.respite"),
                respite: true,
            }
        ).render(true);
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
            .map(i => i.allModifiers).flat();
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

    get armorResistance() {
        return this.items
            .filter(i => i.type === "armor" && this.hasItemEquipped(i.id))
            .reduce((sum, i) => sum + Number(i.system.res), 0);
    }

    resistanceMod(resistanceType) {
        const modifiers = this.allModifiers
            .filter(m => !m.disabled)
            .filter(m => m.system.targetType === ModifierTargetTypes.Resistance && m.system.target === resistanceType)
            .reduce((sum, m) => sum + Number(m.system.value), 0);

        if (resistanceType === ResistanceTypes.Body) {
            return modifiers + this.armorResistance;
        }

        return modifiers;
    }

    get techGnosis() {
        return this.items.filter(i => i.system.tl && i.system.tl > TECHGNOSIS_TL_MAX && !i.system.curio).length;
    }

    get overloaded() {
        if (!this.system.level) return false;

        return this.system.techGnosis > this.system.level;
    }

    async addBasicManeuvers() {
        if (this.system.maneuvers) return;

        return await this.items.createEmbeddedDocuments("Item", BASIC_MANEUVERS.map((slug) => {
            const maneuver = globalThis.fs4.registry.fromSlug(slug, "maneuver");
            if (!maneuver) return;

            return maneuver.toObject();
        }).filter(Boolean));
    }

    async turnStartTick() {
        await this.emptyCache();
    }

    async turnEndTick() {
    }
}
