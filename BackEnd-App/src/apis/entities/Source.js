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
exports.Source = void 0;
var typeorm_1 = require("typeorm");
var Novel_1 = require("./Novel");
var Source = function () {
    var _classDecorators = [(0, typeorm_1.Entity)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _translateEnabled_decorators;
    var _translateEnabled_initializers = [];
    var _translateEnabled_extraInitializers = [];
    var _refinementEnabled_decorators;
    var _refinementEnabled_initializers = [];
    var _refinementEnabled_extraInitializers = [];
    var _novel_decorators;
    var _novel_initializers = [];
    var _novel_extraInitializers = [];
    var Source = _classThis = /** @class */ (function () {
        function Source_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.translateEnabled = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _translateEnabled_initializers, void 0));
            this.refinementEnabled = (__runInitializers(this, _translateEnabled_extraInitializers), __runInitializers(this, _refinementEnabled_initializers, void 0));
            this.novel = (__runInitializers(this, _refinementEnabled_extraInitializers), __runInitializers(this, _novel_initializers, void 0));
            __runInitializers(this, _novel_extraInitializers);
        }
        return Source_1;
    }());
    __setFunctionName(_classThis, "Source");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)()];
        _translateEnabled_decorators = [(0, typeorm_1.Column)({ default: false })];
        _refinementEnabled_decorators = [(0, typeorm_1.Column)({ default: false })];
        _novel_decorators = [(0, typeorm_1.ManyToOne)(function () { return Novel_1.Novel; }, function (novel) { return novel.sources; }, { onDelete: 'CASCADE' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _translateEnabled_decorators, { kind: "field", name: "translateEnabled", static: false, private: false, access: { has: function (obj) { return "translateEnabled" in obj; }, get: function (obj) { return obj.translateEnabled; }, set: function (obj, value) { obj.translateEnabled = value; } }, metadata: _metadata }, _translateEnabled_initializers, _translateEnabled_extraInitializers);
        __esDecorate(null, null, _refinementEnabled_decorators, { kind: "field", name: "refinementEnabled", static: false, private: false, access: { has: function (obj) { return "refinementEnabled" in obj; }, get: function (obj) { return obj.refinementEnabled; }, set: function (obj, value) { obj.refinementEnabled = value; } }, metadata: _metadata }, _refinementEnabled_initializers, _refinementEnabled_extraInitializers);
        __esDecorate(null, null, _novel_decorators, { kind: "field", name: "novel", static: false, private: false, access: { has: function (obj) { return "novel" in obj; }, get: function (obj) { return obj.novel; }, set: function (obj, value) { obj.novel = value; } }, metadata: _metadata }, _novel_initializers, _novel_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Source = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Source = _classThis;
}();
exports.Source = Source;
