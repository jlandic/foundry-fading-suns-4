import { Characteristics, PowerSkills, PreconditionTypes, Skills } from "../system/references.mjs";

const {
    ArrayField,
    NumberField,
    SchemaField,
    StringField,
} = foundry.data.fields;

export const preconditions = () => new ArrayField(new ArrayField(new SchemaField({
    type: new StringField({
        required: true,
        choices: Object.values(PreconditionTypes),
        initial: Object.values(PreconditionTypes)[0],
    }),
    slug: new StringField({ required: true, initial: () => foundry.utils.randomID(16) }),
    value: new StringField({ required: false }),
})));

export const characteristics = () => new ArrayField(new ArrayField(new SchemaField({
    slug: new StringField({ required: true, choices: Object.values(Characteristics), initial: () => Object.values(Characteristics)[0] }),
    value: new NumberField({ required: true }),
})));

export const skills = () => new ArrayField(new ArrayField(new SchemaField({
    slug: new StringField({ required: true, choices: Object.values(Skills), initial: () => Object.values(Skills)[0] }),
    value: new NumberField({ required: true }),
})));

export const powerSkills = () => new ArrayField(new ArrayField(new SchemaField({
    slug: new StringField({ required: true, choices: Object.values(PowerSkills), initial: () => Object.values(PowerSkills)[0] }),
    value: new NumberField({ required: true }),
})));
