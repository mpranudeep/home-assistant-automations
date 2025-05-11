define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sumBadge = void 0;
    function sumBadge(items) {
        return items.reduce((total, item) => {
            if (!item.badge) {
                return total;
            }
            const num = Number(item.badge);
            if (!Number.isInteger(num)) {
                console.warn(`Item with itemKey ${item.itemKey} provided a badge of '${item.badge}', expected integer`);
                return total;
            }
            if (num < 0) {
                console.warn(`Item with itemKey ${item.itemKey} provided a negative numerical badge value of '${item.badge}', expected positive integer. This will be discarded from total.`);
                return total;
            }
            return total + item.badge;
        }, 0);
    }
    exports.sumBadge = sumBadge;
});
