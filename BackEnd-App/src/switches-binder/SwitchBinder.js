"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchBinder = void 0;
var common_1 = require("@nestjs/common");
var event_emitter_1 = require("@nestjs/event-emitter");
var axios_1 = require("axios");
var fs = require("fs");
var path = require("path");
var Constants_1 = require("../common/Constants");
var SwitchBinder = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleStateChange_decorators;
    var SwitchBinder = _classThis = /** @class */ (function () {
        function SwitchBinder_1() {
            this.logger = (__runInitializers(this, _instanceExtraInitializers), new common_1.Logger(SwitchBinder.name));
            this.syncPairs = [];
            var configPath = Constants_1.default.HOME_ASSISTANT_SWITCH_BIND_CONFIG_FILE;
            configPath = path.resolve(configPath);
            this.logger.debug("Switch bind path ".concat(configPath));
            var raw = fs.readFileSync(configPath, 'utf-8');
            this.syncPairs = JSON.parse(raw);
            //this.syncAllStatesOnStartup();
        }
        SwitchBinder_1.prototype.syncAllStatesOnStartup = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, _b, masterSwitch, replicaSwitches, state;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _i = 0, _a = this.syncPairs;
                            _c.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            _b = _a[_i], masterSwitch = _b.masterSwitch, replicaSwitches = _b.replicaSwitches;
                            return [4 /*yield*/, this.getCurrentState(masterSwitch)];
                        case 2:
                            state = _c.sent();
                            if (state === undefined)
                                return [3 /*break*/, 4];
                            // Sync each replica switch to the master switch state
                            return [4 /*yield*/, this.syncTo(masterSwitch, replicaSwitches, state)];
                        case 3:
                            // Sync each replica switch to the master switch state
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5:
                            this.logger.log('🔁 Initial state sync complete');
                            return [2 /*return*/];
                    }
                });
            });
        };
        SwitchBinder_1.prototype.handleStateChange = function (event) {
            return __awaiter(this, void 0, void 0, function () {
                var source, newState, _i, _a, _b, masterSwitch, replicaSwitches, switchesToBeSynched;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            source = event.entityId;
                            newState = (_c = event.newState) === null || _c === void 0 ? void 0 : _c.state;
                            _i = 0, _a = this.syncPairs;
                            _d.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                            _b = _a[_i], masterSwitch = _b.masterSwitch, replicaSwitches = _b.replicaSwitches;
                            if (!(source === masterSwitch)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.syncTo(masterSwitch, replicaSwitches, newState)];
                        case 2:
                            _d.sent();
                            _d.label = 3;
                        case 3:
                            if (!replicaSwitches.includes(source)) return [3 /*break*/, 5];
                            this.logger.log("One of the replica switches state is change ".concat(source));
                            switchesToBeSynched = replicaSwitches;
                            switchesToBeSynched = switchesToBeSynched.filter(function (item) { return item != source; });
                            switchesToBeSynched.push(masterSwitch);
                            return [4 /*yield*/, this.syncTo(source, switchesToBeSynched, newState)];
                        case 4:
                            _d.sent();
                            _d.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        SwitchBinder_1.prototype.getCurrentState = function (entityId) {
            return __awaiter(this, void 0, void 0, function () {
                var url, response, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            url = "http://".concat(Constants_1.default.HOME_ASSISTANT_URL, "/api/states/").concat(entityId);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, axios_1.default.get(url, {
                                    headers: {
                                        Authorization: "Bearer ".concat(Constants_1.default.HOME_ASSISTANT_TOKEN),
                                    },
                                })];
                        case 2:
                            response = _a.sent();
                            return [2 /*return*/, response.data.state];
                        case 3:
                            err_1 = _a.sent();
                            // @ts-ignore
                            this.logger.error("\u274C Failed to fetch state for ".concat(entityId, ": ").concat(err_1.message));
                            return [2 /*return*/, undefined];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        SwitchBinder_1.prototype.syncTo = function (masterSwitch, replicaSwitches, state) {
            return __awaiter(this, void 0, void 0, function () {
                var currentState, _i, replicaSwitches_1, replicaSwitch, replicaState;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCurrentState(masterSwitch)];
                        case 1:
                            currentState = _a.sent();
                            if (currentState === undefined) {
                                this.logger.warn("Could not fetch current state for ".concat(masterSwitch));
                                return [2 /*return*/];
                            }
                            _i = 0, replicaSwitches_1 = replicaSwitches;
                            _a.label = 2;
                        case 2:
                            if (!(_i < replicaSwitches_1.length)) return [3 /*break*/, 6];
                            replicaSwitch = replicaSwitches_1[_i];
                            return [4 /*yield*/, this.getCurrentState(replicaSwitch)];
                        case 3:
                            replicaState = _a.sent();
                            if (replicaState === undefined) {
                                this.logger.warn("Could not fetch current state for ".concat(replicaSwitch));
                                return [3 /*break*/, 5];
                            }
                            if (!(replicaState !== state)) return [3 /*break*/, 5];
                            return [4 /*yield*/, this.syncSingleSwitch(replicaSwitch, state)];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 2];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        SwitchBinder_1.prototype.syncSingleSwitch = function (entityId, state) {
            return __awaiter(this, void 0, void 0, function () {
                var domain, service, payload, url, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            domain = entityId.split('.')[0];
                            payload = { entity_id: entityId };
                            if (domain === 'input_boolean' || domain === 'switch') {
                                service = state === 'on' ? 'turn_on' : 'turn_off';
                            }
                            else if (domain === 'input_button') {
                                service = 'press';
                            }
                            else {
                                this.logger.log("Unsupported domain: ".concat(domain));
                                // return;
                                service = domain;
                            }
                            url = "http://".concat(Constants_1.default.HOME_ASSISTANT_URL, "/api/services/").concat(domain, "/").concat(service);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, axios_1.default.post(url, payload, {
                                    headers: {
                                        Authorization: "Bearer ".concat(Constants_1.default.HOME_ASSISTANT_TOKEN),
                                        'Content-Type': 'application/json',
                                    },
                                })];
                        case 2:
                            _a.sent();
                            this.logger.log("\uD83D\uDD01 Synced ".concat(entityId, " via ").concat(domain, ".").concat(service));
                            return [3 /*break*/, 4];
                        case 3:
                            err_2 = _a.sent();
                            //@ts-ignore
                            this.logger.error("\u274C Failed to sync ".concat(entityId, ": ").concat(err_2.message));
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return SwitchBinder_1;
    }());
    __setFunctionName(_classThis, "SwitchBinder");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleStateChange_decorators = [(0, event_emitter_1.OnEvent)('ha.state_changed')];
        __esDecorate(_classThis, null, _handleStateChange_decorators, { kind: "method", name: "handleStateChange", static: false, private: false, access: { has: function (obj) { return "handleStateChange" in obj; }, get: function (obj) { return obj.handleStateChange; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SwitchBinder = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SwitchBinder = _classThis;
}();
exports.SwitchBinder = SwitchBinder;
