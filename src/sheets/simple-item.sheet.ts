interface CustomData {
  enrichedDescription: string;
}

type SimpleItemSheetData = ItemSheet.Data & CustomData;

class SimpleItemSheet extends ItemSheet {
  get template(): string {
    return `systems/${
      (game as Game).system.id
    }/dist/templates/item/simple-item.sheet.hbs`;
  }

  static get defaultOptions(): ItemSheet.Options {
    const sheetClasses = ['fs4', 'sheet', 'item', 'simple-item'];

    return mergeObject(super.defaultOptions, {
      classes: sheetClasses,
      width: 600,
      height: 800,
      tabs: [],
    });
  }

  async getData(
    options?: Partial<DocumentSheetOptions> | undefined
  ): Promise<ItemSheet.Data<DocumentSheetOptions>> {
    const baseData = await super.getData(options);

    // @ts-expect-error outdated foundry typings - v10
    let description = getProperty(this.item.system, 'description');
    if (description === '') {
      description = '...';
    }

    const sheetData: SimpleItemSheetData = {
      ...baseData,
      // eslint-disable-next-line @typescript-eslint/await-thenable
      enrichedDescription: await TextEditor.enrichHTML(description, {
        secrets: this.object.isOwner,
      }),
    };

    return sheetData;
  }
}

export default SimpleItemSheet;
