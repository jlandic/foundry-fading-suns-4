const {
    HTMLField,
    StringField,
} = foundry.data.fields;

export default class BaseItemDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            slug: new StringField({ required: true, initial: () => foundry.utils.randomID(16) }),
            description: new HTMLField({
                required: true,
                initial: "",
            }),
        };
    }
}
