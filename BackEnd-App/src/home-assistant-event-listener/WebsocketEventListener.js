"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketEventListener = void 0;
var common_1 = require("@nestjs/common");
var ws_1 = require("ws");
var HaStateChangedEvent_1 = require("./HaStateChangedEvent");
var Constants_1 = require("../common/Constants");
var WebsocketEventListener = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var WebsocketEventListener = _classThis = /** @class */ (function () {
        function WebsocketEventListener_1(eventEmitter) {
            this.eventEmitter = eventEmitter;
            this.logger = new common_1.Logger(WebsocketEventListener.name);
            this.ws = null;
            this.reconnectAttempts = 0;
            this.msgId = 1;
            this.HA_URL = "ws://".concat(Constants_1.default.HOME_ASSISTANT_URL, "/api/websocket");
        }
        WebsocketEventListener_1.prototype.onModuleInit = function () {
            if (Constants_1.default.HOME_ASSISTANT_INTEGRATION_ENABLED == 'true') {
                this.connect();
            }
        };
        WebsocketEventListener_1.prototype.nextId = function () {
            return this.msgId++;
        };
        WebsocketEventListener_1.prototype.connect = function () {
            var _this = this;
            this.logger.debug("Connecting to Home Assistant WebSocket ".concat(Constants_1.default.HOME_ASSISTANT_URL, " with auth token..."));
            this.ws = new ws_1.default(this.HA_URL);
            this.ws.on('open', function () {
                _this.logger.log('Connected to Home Assistant');
                _this.reconnectAttempts = 0;
            });
            this.ws.on('message', function (data) {
                var _a, _b, _c;
                var message = JSON.parse(data.toString());
                if (message.type === 'auth_required') {
                    (_a = _this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({
                        type: 'auth',
                        access_token: Constants_1.default.HOME_ASSISTANT_TOKEN,
                    }));
                }
                if (message.type === 'auth_ok') {
                    _this.logger.log('Authenticated successfully');
                    (_b = _this.ws) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({
                        id: _this.nextId(),
                        type: 'subscribe_events',
                        event_type: 'state_changed',
                    }));
                }
                if (message.type === 'event' && ((_c = message.event) === null || _c === void 0 ? void 0 : _c.event_type) === 'state_changed') {
                    var entityId = message.event.data.entity_id;
                    var newState = message.event.data.new_state;
                    var oldState = message.event.data.old_state;
                    _this.logger.debug("Event: ".concat(entityId, " -> ").concat(newState === null || newState === void 0 ? void 0 : newState.state));
                    // 🔥 Emit to NestJS
                    _this.eventEmitter.emit('ha.state_changed', new HaStateChangedEvent_1.HaStateChangedEvent(entityId, newState, oldState));
                }
            });
            this.ws.on('close', function () {
                _this.logger.warn('WebSocket closed, reconnecting...');
                _this.scheduleReconnect();
            });
            this.ws.on('error', function (err) {
                var _a;
                _this.logger.error("WebSocket error: ".concat(err.message));
                (_a = _this.ws) === null || _a === void 0 ? void 0 : _a.close();
            });
        };
        WebsocketEventListener_1.prototype.scheduleReconnect = function () {
            var _this = this;
            var delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            this.logger.log("Reconnecting in ".concat(delay / 1000, "s..."));
            this.reconnectAttempts++;
            setTimeout(function () { return _this.connect(); }, delay);
        };
        return WebsocketEventListener_1;
    }());
    __setFunctionName(_classThis, "WebsocketEventListener");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WebsocketEventListener = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WebsocketEventListener = _classThis;
}();
exports.WebsocketEventListener = WebsocketEventListener;
