"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaStateChangedEvent = void 0;
var HaStateChangedEvent = /** @class */ (function () {
    function HaStateChangedEvent(entityId, newState, oldState) {
        this.entityId = entityId;
        this.newState = newState;
        this.oldState = oldState;
    }
    return HaStateChangedEvent;
}());
exports.HaStateChangedEvent = HaStateChangedEvent;
