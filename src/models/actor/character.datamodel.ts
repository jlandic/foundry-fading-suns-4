import {
  CHARACTER_ITEMS,
  DEFAULT_INITIAL_SKILL_VALUE,
  RESERVED_SKILLS,
  SKILLS,
  type Skill,
} from '../../constants';
import { sortByItemNamePredicate } from '../../helpers/sorting';

// @ts-expect-error outdated foundry typings - v10
export class CharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema(): object {
    // @ts-expect-error outdated foundry typings - v10
    const { NumberField, ObjectField, HTMLField, StringField } =
      foundry.data.fields;

    const defaultNumberFieldOptions = (initial: number): object => ({
      initial,
      integer: true,
      nullable: false,
      min: 0,
    });

    const characteristicField = (): typeof NumberField =>
      new NumberField({
        ...defaultNumberFieldOptions(3),
        min: 1,
        max: 10,
      });
    const skillField = (
      initial: number = DEFAULT_INITIAL_SKILL_VALUE
    ): typeof ObjectField =>
      new ObjectField({
        value: new NumberField({
          ...defaultNumberFieldOptions(initial),
          min: initial,
        }),
        initial: new NumberField({
          ...defaultNumberFieldOptions(initial),
          min: initial,
          max: initial,
        }),
      });
    const moddedValue = (
      initial: number = 0,
      min: number = 0
    ): typeof ObjectField =>
      new ObjectField({
        value: new NumberField({
          ...defaultNumberFieldOptions(initial),
          min,
        }),
        mod: new StringField(),
      });

    return {
      level: new NumberField({
        ...defaultNumberFieldOptions(1),
        min: 1,
      }),
      speed: new StringField(),
      size: new NumberField({
        ...defaultNumberFieldOptions(5),
      }),
      techgnosis: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      rank: new StringField(),
      planet: new StringField(),
      birthdate: new StringField(),
      biography: new HTMLField(),
      vitality: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      revivals: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      bank: new ObjectField({
        vp: new NumberField({
          ...defaultNumberFieldOptions(0),
        }),
        wp: new NumberField({
          ...defaultNumberFieldOptions(0),
        }),
        surge: new NumberField({
          ...defaultNumberFieldOptions(0),
        }),
      }),
      res: new ObjectField({
        body: moddedValue(),
        mind: moddedValue(),
        spirit: moddedValue(),
      }),
      psi: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      urge: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      theurgy: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      hubris: new NumberField({
        ...defaultNumberFieldOptions(0),
      }),
      characteristics: new ObjectField({
        str: characteristicField(),
        dex: characteristicField(),
        end: characteristicField(),
        wits: characteristicField(),
        per: characteristicField(),
        will: characteristicField(),
        pre: characteristicField(),
        int: characteristicField(),
        fth: characteristicField(),
      }),
      skills: new ObjectField(
        SKILLS.reduce((acc: object, skill: string) => {
          let initial = DEFAULT_INITIAL_SKILL_VALUE;

          if (RESERVED_SKILLS.includes(skill as Skill)) {
            initial = 0;
          }

          return {
            ...acc,
            [skill]: skillField(initial),
          };
        }, {})
      ),
    };
  }

  get vitalityRating(): number {
    const system = this._getActorSystem();
    if (system != null) {
      return (
        parseInt(system.size) +
        parseInt(system.characteristics.end) +
        parseInt(system.characteristics.will) +
        parseInt(system.characteristics.fth) +
        parseInt(system.level)
      );
    }

    return -1;
  }

  get revivalRating(): number {
    const system = this._getActorSystem();
    if (system != null) {
      return parseInt(system.size) + parseInt(system.level);
    }

    return -1;
  }

  get revivalAmount(): number {
    const system = this._getActorSystem();
    if (system != null) {
      return this._getSurgeAndRevivalAmountForLevel(parseInt(system.level));
    }

    return -1;
  }

  get surgeRating(): number {
    const system = this._getActorSystem();
    if (system !== null) {
      return (
        Math.max(
          parseInt(system.characteristics.str),
          parseInt(system.characteristics.wits),
          parseInt(system.characteristics.pre)
        ) + parseInt(system.level)
      );
    }

    return -1;
  }

  get surgeAmount(): number {
    const system = this._getActorSystem();
    if (system != null) {
      return this._getSurgeAndRevivalAmountForLevel(parseInt(system.level));
    }

    return -1;
  }

  get bankRating(): number {
    const system = this._getActorSystem();
    if (system != null) {
      return this._getBankCapacityForLevel(parseInt(system.level));
    }

    return -1;
  }

  get affliction(): Item | null {
    return this._itemGetter(CHARACTER_ITEMS.affliction);
  }

  get blessing(): Item | null {
    return this._itemGetter(CHARACTER_ITEMS.blessing);
  }

  get curse(): Item | null {
    return this._itemGetter(CHARACTER_ITEMS.curse);
  }

  get class(): Item | null {
    return this._itemGetter(CHARACTER_ITEMS.class);
  }

  get faction(): Item | null {
    return this._itemGetter(CHARACTER_ITEMS.faction);
  }

  get species(): Item | null {
    return this._itemGetter(CHARACTER_ITEMS.species);
  }

  get callings(): Item[] {
    return this._itemsGetter(CHARACTER_ITEMS.callings);
  }

  get capabilities(): Item[] {
    return this._itemsGetter(CHARACTER_ITEMS.capabilities);
  }

  get perks(): Item[] {
    return this._itemsGetter(CHARACTER_ITEMS.perks);
  }

  get powers(): Item[] {
    return this._itemsGetter(CHARACTER_ITEMS.powers);
  }

  private _getBankCapacityForLevel(level: number): number {
    return Math.floor(level / 2) * 5 + 5;
  }

  private _getSurgeAndRevivalAmountForLevel(level: number): number {
    if (level < 4) return 1;
    if (level < 7) return 2;
    if (level < 10) return 3;

    return 4;
  }

  private _getActorSystem(): any | null {
    // @ts-expect-error outdated foundry typings - v10
    return (this.parent as Actor)?.system;
  }

  private _itemGetter(itemType: string): Item | null {
    return (
      // @ts-expect-error outdated foundry typings - v10
      (this.parent as Actor)?.items?.find(
        (item: Item) => item.type === itemType
      ) ?? null
    );
  }

  private _itemsGetter(itemType: string): Item[] {
    return (
      // @ts-expect-error outdated foundry typings - v10
      (this.parent as Actor)?.items
        ?.filter((item: Item) => item.type === itemType)
        .sort(sortByItemNamePredicate) ?? []
    );
  }
}

export default CharacterDataModel;
