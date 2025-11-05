import BaseItem from "./base-item.mjs";

export default class EShield extends BaseItem {
    recharge() {
        return this.update({
            "system.hits": this.system.hits,
        });
    }
}
