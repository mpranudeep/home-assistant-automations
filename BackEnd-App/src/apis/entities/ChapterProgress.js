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
exports.ChapterProgress = void 0;
var typeorm_1 = require("typeorm");
var Novel_1 = require("./Novel");
var Source_1 = require("./Source");
var ChapterProgress = function () {
    var _classDecorators = [(0, typeorm_1.Entity)(), (0, typeorm_1.Index)(['userId', 'novel', 'source'], { unique: true })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _chapter_decorators;
    var _chapter_initializers = [];
    var _chapter_extraInitializers = [];
    var _novel_decorators;
    var _novel_initializers = [];
    var _novel_extraInitializers = [];
    var _source_decorators;
    var _source_initializers = [];
    var _source_extraInitializers = [];
    var ChapterProgress = _classThis = /** @class */ (function () {
        function ChapterProgress_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.chapter = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _chapter_initializers, void 0));
            this.novel = (__runInitializers(this, _chapter_extraInitializers), __runInitializers(this, _novel_initializers, void 0));
            this.source = (__runInitializers(this, _novel_extraInitializers), __runInitializers(this, _source_initializers, void 0));
            __runInitializers(this, _source_extraInitializers);
        }
        return ChapterProgress_1;
    }());
    __setFunctionName(_classThis, "ChapterProgress");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _userId_decorators = [(0, typeorm_1.Column)()];
        _chapter_decorators = [(0, typeorm_1.Column)()];
        _novel_decorators = [(0, typeorm_1.ManyToOne)(function () { return Novel_1.Novel; }, { onDelete: 'CASCADE' })];
        _source_decorators = [(0, typeorm_1.ManyToOne)(function () { return Source_1.Source; }, { onDelete: 'CASCADE' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _chapter_decorators, { kind: "field", name: "chapter", static: false, private: false, access: { has: function (obj) { return "chapter" in obj; }, get: function (obj) { return obj.chapter; }, set: function (obj, value) { obj.chapter = value; } }, metadata: _metadata }, _chapter_initializers, _chapter_extraInitializers);
        __esDecorate(null, null, _novel_decorators, { kind: "field", name: "novel", static: false, private: false, access: { has: function (obj) { return "novel" in obj; }, get: function (obj) { return obj.novel; }, set: function (obj, value) { obj.novel = value; } }, metadata: _metadata }, _novel_initializers, _novel_extraInitializers);
        __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: function (obj) { return "source" in obj; }, get: function (obj) { return obj.source; }, set: function (obj, value) { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChapterProgress = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChapterProgress = _classThis;
}();
exports.ChapterProgress = ChapterProgress;
