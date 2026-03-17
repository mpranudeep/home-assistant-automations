"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleCache = void 0;
// file-cache.ts
var fs_1 = require("fs");
var path_1 = require("path");
var SimpleCache = /** @class */ (function () {
    function SimpleCache(ttlMs, // default: 20 minutes
    cacheDir) {
        if (ttlMs === void 0) { ttlMs = 1000 * 60 * 20; }
        if (cacheDir === void 0) { cacheDir = ".cache"; }
        this.ttlMs = ttlMs;
        this.cacheDir = cacheDir;
        if (!fs_1.default.existsSync(this.cacheDir)) {
            fs_1.default.mkdirSync(this.cacheDir, { recursive: true });
        }
    }
    SimpleCache.prototype.getFilePath = function (key) {
        var safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_"); // sanitize filename
        return path_1.default.join(this.cacheDir, "".concat(safeKey, ".json"));
    };
    SimpleCache.prototype.set = function (key, value) {
        var entry = {
            value: value,
            expiry: Date.now() + this.ttlMs,
        };
        fs_1.default.writeFileSync(this.getFilePath(key), JSON.stringify(entry, null, 2), "utf-8");
    };
    SimpleCache.prototype.get = function (key) {
        var filePath = this.getFilePath(key);
        if (!fs_1.default.existsSync(filePath))
            return null;
        try {
            var raw = fs_1.default.readFileSync(filePath, "utf-8");
            var entry = JSON.parse(raw);
            if (Date.now() > entry.expiry) {
                fs_1.default.unlinkSync(filePath); // expired → delete
                return null;
            }
            return entry.value;
        }
        catch (_a) {
            return null;
        }
    };
    SimpleCache.prototype.delete = function (key) {
        var filePath = this.getFilePath(key);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    };
    SimpleCache.prototype.clear = function () {
        for (var _i = 0, _a = fs_1.default.readdirSync(this.cacheDir); _i < _a.length; _i++) {
            var file = _a[_i];
            fs_1.default.unlinkSync(path_1.default.join(this.cacheDir, file));
        }
    };
    return SimpleCache;
}());
exports.SimpleCache = SimpleCache;
