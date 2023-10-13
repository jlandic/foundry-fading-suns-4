// @ts-expect-error outdated foundry typings - v10
class SimpleItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema(): object {
    // @ts-expect-error outdated foundry typings - v10
    const { HTMLField } = foundry.data.fields;

    return {
      description: new HTMLField(),
    };
  }
}

export default SimpleItemDataModel;
