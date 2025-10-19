import BaseItem from "./base-item.mjs";

const PROXIED_TYPES = {};

export const ProxyItem = new Proxy(function () { }, {
    construct: (_target, args) => {
        const [data, context] = args;
        if (!(data.type in PROXIED_TYPES)) {
            return new BaseItem(data, context);
        }
    },
    get: (_target, prop) => {
        switch (prop) {
            case "create":
            case "createDocuments":
                return async (data, options) => {
                    if (data.constructor === Array) {
                        return await BaseItem.createDocuments(data, options);
                    }

                    if (!PROXIED_TYPES[data.type]) {
                        return await BaseItem.create(foundry.utils.duplicate(data), options);
                    }

                    const Cls = PROXIED_TYPES[data.type];
                    return await Cls.create(foundry.utils.duplicate(data), options);
                }
            case Symbol.hasInstance:
                return (instance) => Object.values(PROXIED_TYPES).some((cls) => instance instanceof cls) || instance instanceof BaseItem;
            default:
                return BaseItem[prop];
        }
    },
});
