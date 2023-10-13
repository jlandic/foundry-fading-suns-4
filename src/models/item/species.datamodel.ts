import SimpleItemDataModel from './simple-item.datamodel';

class SpeciesDataModel extends SimpleItemDataModel {
  static defineSchema(): object {
    // @ts-expect-error outdated foundry typings - v10
    const { NumberField, StringField } = foundry.data.fields;

    return {
      ...SimpleItemDataModel.defineSchema(),
      size: new NumberField({
        initial: 5,
        integer: true,
        positive: true,
        nullable: false,
      }),
      speed: new StringField(),
    };
  }
}

export default SpeciesDataModel;
