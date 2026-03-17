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
exports.NovelSourceController = void 0;
var common_1 = require("@nestjs/common");
var NovelSourceController = function () {
    var _classDecorators = [(0, common_1.Controller)('novels')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getAllNovels_decorators;
    var _addNovel_decorators;
    var _updateNovel_decorators;
    var _deleteNovel_decorators;
    var _listSources_decorators;
    var _addSource_decorators;
    var _updateSource_decorators;
    var _deleteSource_decorators;
    var _setCurrentChapter_decorators;
    var _getCurrentChapter_decorators;
    var NovelSourceController = _classThis = /** @class */ (function () {
        function NovelSourceController_1(novelsRepo, sourcesRepo, progressRepo) {
            this.novelsRepo = (__runInitializers(this, _instanceExtraInitializers), novelsRepo);
            this.sourcesRepo = sourcesRepo;
            this.progressRepo = progressRepo;
        }
        // --- Novel CRUD ---
        NovelSourceController_1.prototype.getAllNovels = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.novelsRepo.find({ relations: ['sources'] })];
                });
            });
        };
        NovelSourceController_1.prototype.addNovel = function (dto) {
            return __awaiter(this, void 0, void 0, function () {
                var novel;
                return __generator(this, function (_a) {
                    novel = this.novelsRepo.create({ name: dto.name });
                    return [2 /*return*/, this.novelsRepo.save(novel)];
                });
            });
        };
        NovelSourceController_1.prototype.updateNovel = function (novelId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var found;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.novelsRepo.findOne({ where: { id: novelId } })];
                        case 1:
                            found = _a.sent();
                            if (!found)
                                throw new common_1.NotFoundException('Novel not found');
                            if (dto.name !== undefined)
                                found.name = dto.name;
                            return [2 /*return*/, this.novelsRepo.save(found)];
                    }
                });
            });
        };
        NovelSourceController_1.prototype.deleteNovel = function (novelId) {
            return __awaiter(this, void 0, void 0, function () {
                var found;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.novelsRepo.findOne({ where: { id: novelId } })];
                        case 1:
                            found = _a.sent();
                            if (!found)
                                throw new common_1.NotFoundException('Novel not found');
                            return [4 /*yield*/, this.novelsRepo.remove(found)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { deleted: true }];
                    }
                });
            });
        };
        // --- Source CRUD under a novel ---
        NovelSourceController_1.prototype.listSources = function (novelId) {
            return __awaiter(this, void 0, void 0, function () {
                var novel;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.novelsRepo.findOne({ where: { id: novelId }, relations: ['sources'] })];
                        case 1:
                            novel = _a.sent();
                            if (!novel)
                                throw new common_1.NotFoundException('Novel not found');
                            return [2 /*return*/, novel.sources || []];
                    }
                });
            });
        };
        NovelSourceController_1.prototype.addSource = function (novelId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var novel, source;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.novelsRepo.findOne({ where: { id: novelId }, relations: ['sources'] })];
                        case 1:
                            novel = _a.sent();
                            if (!novel)
                                throw new common_1.NotFoundException('Novel not found');
                            source = this.sourcesRepo.create({
                                name: dto.name,
                                translateEnabled: !!dto.translateEnabled,
                                refinementEnabled: !!dto.refinementEnabled,
                                novel: novel
                            });
                            return [2 /*return*/, this.sourcesRepo.save(source)];
                    }
                });
            });
        };
        NovelSourceController_1.prototype.updateSource = function (novelId, sourceId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var source;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sourcesRepo.findOne({ where: { id: sourceId }, relations: ['novel'] })];
                        case 1:
                            source = _a.sent();
                            if (!source || !source.novel || source.novel.id !== novelId)
                                throw new common_1.NotFoundException('Source not found');
                            if (dto.name !== undefined)
                                source.name = dto.name;
                            if (dto.translateEnabled !== undefined)
                                source.translateEnabled = dto.translateEnabled;
                            if (dto.refinementEnabled !== undefined)
                                source.refinementEnabled = dto.refinementEnabled;
                            return [2 /*return*/, this.sourcesRepo.save(source)];
                    }
                });
            });
        };
        NovelSourceController_1.prototype.deleteSource = function (novelId, sourceId) {
            return __awaiter(this, void 0, void 0, function () {
                var source;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.sourcesRepo.findOne({ where: { id: sourceId }, relations: ['novel'] })];
                        case 1:
                            source = _a.sent();
                            if (!source || !source.novel || source.novel.id !== novelId)
                                throw new common_1.NotFoundException('Source not found');
                            return [4 /*yield*/, this.sourcesRepo.remove(source)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, { deleted: true }];
                    }
                });
            });
        };
        // --- Persistent Per-user chapter progress ---
        NovelSourceController_1.prototype.setCurrentChapter = function (novelId, sourceId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var userId, chapter, novel, source, progress;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            userId = (_a = dto.userId) === null || _a === void 0 ? void 0 : _a.trim();
                            chapter = dto.chapter;
                            if (!userId || chapter === undefined) {
                                throw new common_1.BadRequestException('userId and chapter are required');
                            }
                            return [4 /*yield*/, this.novelsRepo.findOne({ where: { id: novelId } })];
                        case 1:
                            novel = _b.sent();
                            if (!novel)
                                throw new common_1.NotFoundException('Novel not found');
                            return [4 /*yield*/, this.sourcesRepo.findOne({ where: { id: sourceId }, relations: ['novel'] })];
                        case 2:
                            source = _b.sent();
                            if (!source || !source.novel || source.novel.id !== novelId)
                                throw new common_1.NotFoundException('Source not found');
                            return [4 /*yield*/, this.progressRepo.findOne({
                                    where: { userId: userId, novel: { id: novelId }, source: { id: sourceId } },
                                    relations: ['novel', 'source']
                                })];
                        case 3:
                            progress = _b.sent();
                            if (progress) {
                                progress.chapter = chapter;
                            }
                            else {
                                progress = this.progressRepo.create({
                                    userId: userId,
                                    chapter: chapter,
                                    novel: novel,
                                    source: source
                                });
                            }
                            return [4 /*yield*/, this.progressRepo.save(progress)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/, { userId: userId, chapter: chapter }];
                    }
                });
            });
        };
        NovelSourceController_1.prototype.getCurrentChapter = function (novelId, sourceId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var progress;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!userId)
                                throw new common_1.BadRequestException('userId is required');
                            return [4 /*yield*/, this.progressRepo.findOne({
                                    where: { userId: userId, novel: { id: novelId }, source: { id: sourceId } },
                                    relations: ['novel', 'source']
                                })];
                        case 1:
                            progress = _a.sent();
                            return [2 /*return*/, { userId: userId, chapter: progress ? progress.chapter : null }];
                    }
                });
            });
        };
        return NovelSourceController_1;
    }());
    __setFunctionName(_classThis, "NovelSourceController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getAllNovels_decorators = [(0, common_1.Get)()];
        _addNovel_decorators = [(0, common_1.Post)()];
        _updateNovel_decorators = [(0, common_1.Put)(':novelId')];
        _deleteNovel_decorators = [(0, common_1.Delete)(':novelId')];
        _listSources_decorators = [(0, common_1.Get)(':novelId/sources')];
        _addSource_decorators = [(0, common_1.Post)(':novelId/sources')];
        _updateSource_decorators = [(0, common_1.Put)(':novelId/sources/:sourceId')];
        _deleteSource_decorators = [(0, common_1.Delete)(':novelId/sources/:sourceId')];
        _setCurrentChapter_decorators = [(0, common_1.Post)(':novelId/sources/:sourceId/chapter')];
        _getCurrentChapter_decorators = [(0, common_1.Get)(':novelId/sources/:sourceId/chapter')];
        __esDecorate(_classThis, null, _getAllNovels_decorators, { kind: "method", name: "getAllNovels", static: false, private: false, access: { has: function (obj) { return "getAllNovels" in obj; }, get: function (obj) { return obj.getAllNovels; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addNovel_decorators, { kind: "method", name: "addNovel", static: false, private: false, access: { has: function (obj) { return "addNovel" in obj; }, get: function (obj) { return obj.addNovel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateNovel_decorators, { kind: "method", name: "updateNovel", static: false, private: false, access: { has: function (obj) { return "updateNovel" in obj; }, get: function (obj) { return obj.updateNovel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteNovel_decorators, { kind: "method", name: "deleteNovel", static: false, private: false, access: { has: function (obj) { return "deleteNovel" in obj; }, get: function (obj) { return obj.deleteNovel; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _listSources_decorators, { kind: "method", name: "listSources", static: false, private: false, access: { has: function (obj) { return "listSources" in obj; }, get: function (obj) { return obj.listSources; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addSource_decorators, { kind: "method", name: "addSource", static: false, private: false, access: { has: function (obj) { return "addSource" in obj; }, get: function (obj) { return obj.addSource; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateSource_decorators, { kind: "method", name: "updateSource", static: false, private: false, access: { has: function (obj) { return "updateSource" in obj; }, get: function (obj) { return obj.updateSource; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteSource_decorators, { kind: "method", name: "deleteSource", static: false, private: false, access: { has: function (obj) { return "deleteSource" in obj; }, get: function (obj) { return obj.deleteSource; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _setCurrentChapter_decorators, { kind: "method", name: "setCurrentChapter", static: false, private: false, access: { has: function (obj) { return "setCurrentChapter" in obj; }, get: function (obj) { return obj.setCurrentChapter; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getCurrentChapter_decorators, { kind: "method", name: "getCurrentChapter", static: false, private: false, access: { has: function (obj) { return "getCurrentChapter" in obj; }, get: function (obj) { return obj.getCurrentChapter; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NovelSourceController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NovelSourceController = _classThis;
}();
exports.NovelSourceController = NovelSourceController;
