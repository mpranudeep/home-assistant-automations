"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HaStateChangedEvent = void 0;
class HaStateChangedEvent {
    constructor(entityId, newState, oldState) {
        this.entityId = entityId;
        this.newState = newState;
        this.oldState = oldState;
    }
}
exports.HaStateChangedEvent = HaStateChangedEvent;
