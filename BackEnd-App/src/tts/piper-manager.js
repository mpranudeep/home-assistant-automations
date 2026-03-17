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
exports.PiperManager = void 0;
var common_1 = require("@nestjs/common");
var net = require("net");
var PiperManager = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PiperManager = _classThis = /** @class */ (function () {
        function PiperManager_1() {
            this.logger = new common_1.Logger(PiperManager.name);
            this.host = '192.168.68.120';
            this.port = 5021;
        }
        PiperManager_1.prototype.speak = function (text) {
            return __awaiter(this, void 0, void 0, function () {
                var pcm;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.synthesizeViaWyoming(text)];
                        case 1:
                            pcm = _a.sent();
                            return [2 /*return*/, this.pcmToWav(pcm.audioBuffer, pcm.sampleRate, pcm.channels, pcm.sampleWidth)];
                    }
                });
            });
        };
        PiperManager_1.prototype.synthesizeViaWyoming = function (text) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var socket = net.createConnection({ host: _this.host, port: _this.port });
                            var settled = false;
                            var streamBuffer = Buffer.alloc(0);
                            var currentEvent = null;
                            var currentDataLength = 0;
                            var currentPayloadLength = 0;
                            var audioChunks = [];
                            var sampleRate = 22050;
                            var channels = 1;
                            var sampleWidth = 2;
                            var cleanup = function () {
                                socket.removeAllListeners();
                                socket.end();
                                socket.destroy();
                            };
                            var normalizeSampleWidthBytes = function (value, fallback) {
                                var parsed = Number(value);
                                if (!Number.isFinite(parsed) || parsed <= 0)
                                    return fallback;
                                // Some implementations may report bits (e.g. 16) instead of bytes (e.g. 2).
                                if (parsed > 8)
                                    return Math.max(1, Math.round(parsed / 8));
                                return parsed;
                            };
                            socket.on('connect', function () {
                                var dataBuffer = Buffer.from(JSON.stringify({ text: text }), 'utf8');
                                var message = {
                                    type: 'synthesize',
                                    data_length: dataBuffer.length,
                                    payload_length: 0,
                                };
                                socket.write(Buffer.concat([Buffer.from("".concat(JSON.stringify(message), "\n"), 'utf8'), dataBuffer]));
                            });
                            socket.on('data', function (chunk) {
                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                                streamBuffer = Buffer.concat([streamBuffer, chunk]);
                                while (true) {
                                    if (!currentEvent) {
                                        var newlineIndex = streamBuffer.indexOf(0x0a);
                                        if (newlineIndex === -1)
                                            break;
                                        var rawHeader = streamBuffer.slice(0, newlineIndex).toString('utf8').trim();
                                        streamBuffer = streamBuffer.slice(newlineIndex + 1);
                                        if (!rawHeader)
                                            continue;
                                        try {
                                            currentEvent = JSON.parse(rawHeader);
                                        }
                                        catch (error) {
                                            cleanup();
                                            settled = true;
                                            reject(new Error("Invalid Wyoming header: ".concat(rawHeader)));
                                            return;
                                        }
                                        currentDataLength = (_a = currentEvent.data_length) !== null && _a !== void 0 ? _a : 0;
                                        currentPayloadLength = (_b = currentEvent.payload_length) !== null && _b !== void 0 ? _b : 0;
                                    }
                                    if (!currentEvent)
                                        break;
                                    if (streamBuffer.length < currentDataLength + currentPayloadLength)
                                        break;
                                    if (currentDataLength > 0) {
                                        var rawData = streamBuffer.slice(0, currentDataLength).toString('utf8').trim();
                                        streamBuffer = streamBuffer.slice(currentDataLength);
                                        if (rawData) {
                                            try {
                                                currentEvent.data = JSON.parse(rawData);
                                            }
                                            catch (error) {
                                                cleanup();
                                                settled = true;
                                                reject(new Error("Invalid Wyoming data JSON: ".concat(rawData)));
                                                return;
                                            }
                                        }
                                    }
                                    var payload = Buffer.alloc(0);
                                    if (currentPayloadLength > 0) {
                                        payload = streamBuffer.slice(0, currentPayloadLength);
                                        streamBuffer = streamBuffer.slice(currentPayloadLength);
                                    }
                                    if (currentEvent.type === 'audio-start') {
                                        sampleRate = Number((_d = (_c = currentEvent.data) === null || _c === void 0 ? void 0 : _c.rate) !== null && _d !== void 0 ? _d : sampleRate);
                                        channels = Number((_f = (_e = currentEvent.data) === null || _e === void 0 ? void 0 : _e.channels) !== null && _f !== void 0 ? _f : channels);
                                        sampleWidth = normalizeSampleWidthBytes((_g = currentEvent.data) === null || _g === void 0 ? void 0 : _g.width, sampleWidth);
                                    }
                                    else if (currentEvent.type === 'audio-chunk') {
                                        // Keep format updated from chunk metadata if provided.
                                        sampleRate = Number((_j = (_h = currentEvent.data) === null || _h === void 0 ? void 0 : _h.rate) !== null && _j !== void 0 ? _j : sampleRate);
                                        channels = Number((_l = (_k = currentEvent.data) === null || _k === void 0 ? void 0 : _k.channels) !== null && _l !== void 0 ? _l : channels);
                                        sampleWidth = normalizeSampleWidthBytes((_m = currentEvent.data) === null || _m === void 0 ? void 0 : _m.width, sampleWidth);
                                        if (payload.length > 0) {
                                            audioChunks.push(payload);
                                        }
                                    }
                                    else if (currentEvent.type === 'audio-stop') {
                                        cleanup();
                                        settled = true;
                                        resolve({
                                            audioBuffer: Buffer.concat(audioChunks),
                                            sampleRate: sampleRate,
                                            channels: channels,
                                            sampleWidth: sampleWidth,
                                        });
                                        return;
                                    }
                                    else if (currentEvent.type === 'error') {
                                        cleanup();
                                        settled = true;
                                        reject(new Error("Wyoming error: ".concat(JSON.stringify((_o = currentEvent.data) !== null && _o !== void 0 ? _o : {}))));
                                        return;
                                    }
                                    currentEvent = null;
                                    currentDataLength = 0;
                                    currentPayloadLength = 0;
                                }
                            });
                            socket.on('error', function (error) {
                                if (settled)
                                    return;
                                cleanup();
                                settled = true;
                                reject(error);
                            });
                            socket.on('end', function () {
                                if (settled)
                                    return;
                                if (audioChunks.length === 0) {
                                    settled = true;
                                    reject(new Error('Wyoming server closed connection without audio output'));
                                    return;
                                }
                                settled = true;
                                resolve({
                                    audioBuffer: Buffer.concat(audioChunks),
                                    sampleRate: sampleRate,
                                    channels: channels,
                                    sampleWidth: sampleWidth,
                                });
                            });
                        })];
                });
            });
        };
        PiperManager_1.prototype.pcmToWav = function (pcm, sampleRate, channels, sampleWidth) {
            var blockAlign = channels * sampleWidth;
            var byteRate = sampleRate * blockAlign;
            var wavHeader = Buffer.alloc(44);
            wavHeader.write('RIFF', 0);
            wavHeader.writeUInt32LE(36 + pcm.length, 4);
            wavHeader.write('WAVE', 8);
            wavHeader.write('fmt ', 12);
            wavHeader.writeUInt32LE(16, 16);
            wavHeader.writeUInt16LE(1, 20);
            wavHeader.writeUInt16LE(channels, 22);
            wavHeader.writeUInt32LE(sampleRate, 24);
            wavHeader.writeUInt32LE(byteRate, 28);
            wavHeader.writeUInt16LE(blockAlign, 32);
            wavHeader.writeUInt16LE(sampleWidth * 8, 34);
            wavHeader.write('data', 36);
            wavHeader.writeUInt32LE(pcm.length, 40);
            return Buffer.concat([wavHeader, pcm]);
        };
        return PiperManager_1;
    }());
    __setFunctionName(_classThis, "PiperManager");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PiperManager = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PiperManager = _classThis;
}();
exports.PiperManager = PiperManager;
