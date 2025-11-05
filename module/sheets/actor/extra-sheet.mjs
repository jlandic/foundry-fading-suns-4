import BaseActorSheet from "./base-actor-sheet.mjs";

export default class ExtraSheet extends BaseActorSheet {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
        actions: {
            addManeuver: ExtraSheet._addManeuver,
            deleteManeuver: ExtraSheet._deleteManeuver,
        },
    });

    static TABS = {
        primary: {
            tabs: [
                BaseActorSheet.TAB_REFERENCES.statsExtra,
                BaseActorSheet.TAB_REFERENCES.inventory,
                BaseActorSheet.TAB_REFERENCES.notes,
            ],
            initial: "statsExtra",
        }
    };

    get droppableAsReferences() {
        return [
            "species",
        ];
    }

    get droppableAsEmbedded() {
        return [
            "equipment",
            "state",
            "weapon",
            "armor",
            "handshield",
            "eshield",
            "power",
        ];
    }

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);

        options.parts = [
            "header",
            "tabs",
            "statsExtra",
            "inventory",
            "notes",
        ].filter(Boolean);
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
            maneuvers: Object.keys(this.actor.system.maneuvers).map((id) => {
                const maneuver = this.actor.system.maneuvers[id];
                return {
                    id,
                    name: maneuver.name,
                    goal: maneuver.goal,
                    impact: maneuver.impact,
                    controls: [
                        {
                            icon: "trash",
                            i18nKey: "fs4.sheets.common.delete",
                            action: "deleteManeuver",
                            requiresEdit: true,
                        }
                    ]
                };
            }),
        });

        return context;
    }

    static async _addManeuver(event) {
        event.preventDefault();

        await this.actor.update({
            [`system.maneuvers.${foundry.utils.randomID()}`]: {
                name: "",
                goal: 0,
                impact: "",
            },
        });
    }

    static async _deleteManeuver(event, target) {
        event.preventDefault();

        const id = target.dataset.id;

        await this.actor.update({
            [`system.maneuvers.-=${id}`]: null,
        });
    }
}
