import { RollFavor } from "../system/references.mjs";
import { DiceThrow, RollData } from "../system/rolls.mjs";

export default class RollApp extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2,
) {
    constructor(actor, rollIntention) {
        super();

        this.actor = actor;
        this.rollIntention = rollIntention;
        this.availableModifiers = this._prepareAvailableModifiers();
    }

    static DEFAULT_OPTIONS = {
        position: { width: 400, height: "auto" },
        tag: "form",
        window: {
            icon: "fas fa-dice",
            resizable: true,
            contentClasses: ["roll"],
        },
        form: {
            submitOnChange: false,
            handler: RollApp._onSubmit,
            closeOnSubmit: true,
        },
    };

    static PARTS = {
        main: {
            template: "systems/fading-suns-4/templates/apps/roll.hbs",
            scrollable: [""],
        },
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        foundry.utils.mergeObject(context, {
            baseRoll: new RollData({
                actor: this.actor,
                rollIntention: this.rollIntention,
            }),
            actor: this.actor.toObject(),
            isExtra: this.actor.type === "extra",
            availableModifiers: this.availableModifiers,
            title: this.rollIntention.toString(),
            rollIntention: this.rollIntention,
        });

        return context;
    }

    _prepareAvailableModifiers() {
        return this.actor.allModifiers
            .filter(effect => !effect.disabled && effect.appliesToRoll(this.rollIntention))
            .map(effect => ({
                ...effect.toObject(),
                parent: {
                    name: effect.parent?.name || "",
                },
                humanReadable: effect.humanReadable,
            }));
    }

    _fetchSelectedModifiers(formData) {
        return this.actor.allModifiers
            .filter(effect => formData[`active.${effect._id}`] === "true");
    }

    static async _onSubmit(event, _form, formData) {
        event.preventDefault();

        const data = Object.fromEntries(formData);
        const rollData = new RollData({
            actor: this.actor,
            rollIntention: this.rollIntention,
            goalModifier: Number(data.goalModifier) || 0,
            favor: data.favorable === "true"
                ? RollFavor.Favorable
                : (data.unfavorable === "true" ? RollFavor.Unfavorable : RollFavor.None),
            modifiers: this._fetchSelectedModifiers(data),
        });

        const diceRoll = await new DiceThrow(rollData).roll();
        await diceRoll.sendToChat();

        this.close();
    }
}
