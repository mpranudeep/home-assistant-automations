"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WebsocketEventListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketEventListener = void 0;
const common_1 = require("@nestjs/common");
const ws_1 = __importDefault(require("ws"));
const event_emitter_1 = require("@nestjs/event-emitter");
const HaStateChangedEvent_1 = require("./HaStateChangedEvent");
const Constants_1 = __importDefault(require("../common/Constants"));
let WebsocketEventListener = WebsocketEventListener_1 = class WebsocketEventListener {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(WebsocketEventListener_1.name);
        this.ws = null;
        this.reconnectAttempts = 0;
        this.msgId = 1;
        this.HA_URL = `ws://${Constants_1.default.HOME_ASSISTANT_URL}/api/websocket`;
    }
    onModuleInit() {
        if (Constants_1.default.HOME_ASSISTANT_INTEGRATION_ENABLED == 'true') {
            this.connect();
        }
    }
    nextId() {
        return this.msgId++;
    }
    connect() {
        this.logger.debug(`Connecting to Home Assistant WebSocket ${Constants_1.default.HOME_ASSISTANT_URL} with auth token...`);
        this.ws = new ws_1.default(this.HA_URL);
        this.ws.on('open', () => {
            this.logger.log('Connected to Home Assistant');
            this.reconnectAttempts = 0;
        });
        this.ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            if (message.type === 'auth_required') {
                this.ws?.send(JSON.stringify({
                    type: 'auth',
                    access_token: Constants_1.default.HOME_ASSISTANT_TOKEN,
                }));
            }
            if (message.type === 'auth_ok') {
                this.logger.log('Authenticated successfully');
                this.ws?.send(JSON.stringify({
                    id: this.nextId(),
                    type: 'subscribe_events',
                    event_type: 'state_changed',
                }));
            }
            if (message.type === 'event' && message.event?.event_type === 'state_changed') {
                const entityId = message.event.data.entity_id;
                const newState = message.event.data.new_state;
                const oldState = message.event.data.old_state;
                this.logger.debug(`Event: ${entityId} -> ${newState?.state}`);
                // 🔥 Emit to NestJS
                this.eventEmitter.emit('ha.state_changed', new HaStateChangedEvent_1.HaStateChangedEvent(entityId, newState, oldState));
            }
        });
        this.ws.on('close', () => {
            this.logger.warn('WebSocket closed, reconnecting...');
            this.scheduleReconnect();
        });
        this.ws.on('error', (err) => {
            this.logger.error(`WebSocket error: ${err.message}`);
            this.ws?.close();
        });
    }
    scheduleReconnect() {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        this.logger.log(`Reconnecting in ${delay / 1000}s...`);
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), delay);
    }
};
exports.WebsocketEventListener = WebsocketEventListener;
exports.WebsocketEventListener = WebsocketEventListener = WebsocketEventListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [event_emitter_1.EventEmitter2])
], WebsocketEventListener);
