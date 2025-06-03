"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SwitchBinder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchBinder = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const HaStateChangedEvent_1 = require("../home-assistant-event-listener/HaStateChangedEvent");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Constants_1 = __importDefault(require("../common/Constants"));
let SwitchBinder = SwitchBinder_1 = class SwitchBinder {
    constructor() {
        this.logger = new common_1.Logger(SwitchBinder_1.name);
        this.syncPairs = [];
        let configPath = Constants_1.default.HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE;
        configPath = path.resolve(configPath);
        this.logger.debug(`Switch bind path ${configPath}`);
        const raw = fs.readFileSync(configPath, 'utf-8');
        this.syncPairs = JSON.parse(raw);
        //this.syncAllStatesOnStartup();
    }
    async syncAllStatesOnStartup() {
        for (const { masterSwitch, replicaSwitches } of this.syncPairs) {
            const state = await this.getCurrentState(masterSwitch);
            if (state === undefined)
                continue;
            // Sync each replica switch to the master switch state
            await this.syncTo(masterSwitch, replicaSwitches, state);
        }
        this.logger.log('🔁 Initial state sync complete');
    }
    async handleStateChange(event) {
        const source = event.entityId;
        const newState = event.newState?.state;
        for (const { masterSwitch, replicaSwitches } of this.syncPairs) {
            // If the source is the master switch, sync all replicas to the new state
            if (source === masterSwitch) {
                await this.syncTo(masterSwitch, replicaSwitches, newState);
            }
            // If the source is one of the replica switches, sync the master switch to its state
            if (replicaSwitches.includes(source)) {
                this.logger.log(`One of the replica switches state is change ${source}`);
                let switchesToBeSynched = replicaSwitches;
                switchesToBeSynched = switchesToBeSynched.filter(item => item != source);
                switchesToBeSynched.push(masterSwitch);
                await this.syncTo(source, switchesToBeSynched, newState);
            }
        }
    }
    async getCurrentState(entityId) {
        const url = `http://${Constants_1.default.HOME_ASSISTANT_URL}/api/states/${entityId}`;
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    Authorization: `Bearer ${Constants_1.default.HOME_ASSISTANT_TOKEN}`,
                },
            });
            return response.data.state;
        }
        catch (err) {
            // @ts-ignore
            this.logger.error(`❌ Failed to fetch state for ${entityId}: ${err.message}`);
            return undefined;
        }
    }
    async syncTo(masterSwitch, replicaSwitches, state) {
        // Get current state of master switch
        const currentState = await this.getCurrentState(masterSwitch);
        if (currentState === undefined) {
            this.logger.warn(`Could not fetch current state for ${masterSwitch}`);
            return;
        }
        // Iterate over each replica switch and sync them
        for (const replicaSwitch of replicaSwitches) {
            const replicaState = await this.getCurrentState(replicaSwitch);
            if (replicaState === undefined) {
                this.logger.warn(`Could not fetch current state for ${replicaSwitch}`);
                continue;
            }
            if (replicaState !== state) {
                await this.syncSingleSwitch(replicaSwitch, state);
            }
        }
    }
    async syncSingleSwitch(entityId, state) {
        const [domain] = entityId.split('.');
        let service;
        let payload = { entity_id: entityId };
        if (domain === 'input_boolean' || domain === 'switch') {
            service = state === 'on' ? 'turn_on' : 'turn_off';
        }
        else if (domain === 'input_button') {
            service = 'press';
        }
        else {
            this.logger.log(`Unsupported domain: ${domain}`);
            // return;
            service = domain;
        }
        const url = `http://${Constants_1.default.HOME_ASSISTANT_URL}/api/services/${domain}/${service}`;
        try {
            await axios_1.default.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${Constants_1.default.HOME_ASSISTANT_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`🔁 Synced ${entityId} via ${domain}.${service}`);
        }
        catch (err) {
            //@ts-ignore
            this.logger.error(`❌ Failed to sync ${entityId}: ${err.message}`);
        }
    }
};
exports.SwitchBinder = SwitchBinder;
__decorate([
    (0, event_emitter_1.OnEvent)('ha.state_changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [HaStateChangedEvent_1.HaStateChangedEvent]),
    __metadata("design:returntype", Promise)
], SwitchBinder.prototype, "handleStateChange", null);
exports.SwitchBinder = SwitchBinder = SwitchBinder_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SwitchBinder);
