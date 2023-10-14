import { HAS_ONE_ITEM_TYPES, UNIQUE_INSTANCE_ITEM_TYPES } from '../constants';

class FS4CharacterSheet extends ActorSheet {
  get template(): string {
    return `systems/${
      (game as Game).system.id
    }/dist/templates/actor/character.sheet.hbs`;
  }

  static get defaultOptions(): ActorSheet.Options {
    const classes = ['fs4', 'sheet', 'actor', 'character'];

    return mergeObject(super.defaultOptions, {
      classes,
      width: 600,
      height: 800,
      tabs: [],
    });
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);

    html.find('.item-show').on('click', (event) => {
      // @ts-expect-error outdated foundry typings - v10
      fromUuidSync(event.currentTarget?.getAttribute('data-uuid')).sheet.render(
        true
      );
    });
  }

  protected async _onDropItem(
    event: DragEvent,
    data: ActorSheet.DropData.Item
  ): Promise<unknown> {
    // @ts-expect-error outdated foundry typings - v10
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    if (HAS_ONE_ITEM_TYPES.includes(itemData.type)) {
      const existing = this.actor.items.find(
        (item) => item.type === itemData.type
      );

      if (existing !== undefined) {
        // @ts-expect-error outdated foundry typings - v10
        this.actor.items.delete(existing.id);
      }
    } else if (UNIQUE_INSTANCE_ITEM_TYPES.includes(itemData.type)) {
      const existing = this.actor.items.find(
        // @ts-expect-error outdated foundry typings - v10
        (item) => item.flags.core.sourceId === `Item.${itemData._id}`
      );

      if (existing !== undefined) {
        return;
      }
    }

    return await super._onDropItem(event, data);
  }
}

export default FS4CharacterSheet;
