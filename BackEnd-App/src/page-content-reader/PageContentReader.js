"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var readability_1 = require("@mozilla/readability");
var common_1 = require("@nestjs/common");
var html_to_text_1 = require("html-to-text");
var axios_1 = require("axios");
var SimpleCache_1 = require("../common/SimpleCache");
var genai_1 = require("@google/genai");
var fs_1 = require("fs");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var Translate = require('@google-cloud/translate').v2.Translate;
var path = require('path');
// Set the path relative to your script's location
var keyPath = path.join('src', 'google_key.json');
var translate = new Translate({ key: process.env.AC_MP_GOOGLE_API_KEY });
var ai = new genai_1.GoogleGenAI({ apiKey: process.env.AC_HK_GOOGLE_API_KEY });
var contentCache = new SimpleCache_1.SimpleCache(1000 * 60 * 60, "rundata/cache");
var PageContentReader = /** @class */ (function () {
    function PageContentReader() {
        this.log = new common_1.Logger(PageContentReader.name);
    }
    // -------------------
    // PUBLIC ENTRYPOINT
    // -------------------
    /**
     * Main entrypoint. Returns processed content for a URL, with optional spell correction.
     * @param url - The URL of the page to read
     * @param spellCorrectEnabled - Whether to run AI spell/grammar correction
     */
    PageContentReader.prototype.getReadableContent = function (url_1) {
        return __awaiter(this, arguments, void 0, function (url, spellCorrectEnabled) {
            var cacheKey, cached, result;
            if (spellCorrectEnabled === void 0) { spellCorrectEnabled = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) {
                            this.log.warn("Invalid or missing URL input to getReadableContent");
                            throw new Error("Invalid or missing URL. Must be a valid http(s) URL.");
                        }
                        cacheKey = "".concat(url, "|").concat(!!spellCorrectEnabled);
                        cached = contentCache.get(cacheKey);
                        if (cached) {
                            this.log.debug("Cache hit for ".concat(url, " [spellCorrect=").concat(spellCorrectEnabled, "]"));
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, this.scrapeAndProcessContent(url, spellCorrectEnabled)];
                    case 1:
                        result = _a.sent();
                        contentCache.set(cacheKey, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    // -------------------
    // SCRAPING + PARSING
    // -------------------
    PageContentReader.prototype.scrapeAndProcessContent = function (url_1) {
        return __awaiter(this, arguments, void 0, function (url, spellCorrectEnabled) {
            var title, lines, documentDom, match, rawId, chapterNo, payload, response, data, html, dom, reader, article, plainText, siteHandler, _a, content, nextChapterURL, err_1;
            var _b, _c, _d, _e;
            if (spellCorrectEnabled === void 0) { spellCorrectEnabled = false; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 7, , 8]);
                        title = void 0;
                        lines = [];
                        documentDom = void 0;
                        if (!url.includes("wtr-lab.com")) return [3 /*break*/, 3];
                        match = url.match(/\/novel\/(\d+)\/[^/]+\/chapter-(\d+)/i);
                        if (!match) {
                            throw new Error("Invalid wtr-lab URL format");
                        }
                        rawId = parseInt(match[1], 10);
                        chapterNo = parseInt(match[2], 10);
                        payload = {
                            translate: "web",
                            language: "en",
                            raw_id: rawId,
                            chapter_no: chapterNo,
                            retry: false,
                            force_retry: false,
                        };
                        return [4 /*yield*/, fetch("https://wtr-lab.com/api/reader/get", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                            })];
                    case 1:
                        response = _f.sent();
                        if (!response.ok) {
                            throw new Error("wtr-lab API failed: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _f.sent();
                        lines = (_d = (_c = (_b = data === null || data === void 0 ? void 0 : data.data) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.body) !== null && _d !== void 0 ? _d : [];
                        title = "Chapter ".concat(chapterNo);
                        // Minimal DOM to keep handler signature consistent
                        documentDom = new jsdom_1.JSDOM("<root></root>", { url: url }).window.document;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.fetchHtmlWithFallback(url)];
                    case 4:
                        html = _f.sent();
                        dom = new jsdom_1.JSDOM(html, { url: url });
                        documentDom = dom.window.document;
                        reader = new readability_1.Readability(dom.window.document);
                        article = reader.parse();
                        if (!(article === null || article === void 0 ? void 0 : article.content)) {
                            throw new Error("Could not parse article content.");
                        }
                        title = ((_e = article.title) === null || _e === void 0 ? void 0 : _e.trim()) || this.getTitleFromUrl(url);
                        plainText = this.removeLinks((0, html_to_text_1.convert)(article.content, { wordwrap: false }));
                        lines = this.sanitizeLines(plainText);
                        _f.label = 5;
                    case 5:
                        siteHandler = this.getSiteHandler(url);
                        return [4 /*yield*/, siteHandler(documentDom, url, lines, spellCorrectEnabled)];
                    case 6:
                        _a = _f.sent(), content = _a.content, nextChapterURL = _a.nextChapterURL;
                        this.log.debug("Title: ".concat(title));
                        this.log.debug("Content length: ".concat(content.length, " chars"));
                        return [2 /*return*/, { title: title, content: content, nextChapterURL: nextChapterURL }];
                    case 7:
                        err_1 = _f.sent();
                        this.log.error("Error scraping ".concat(url, ": ").concat(err_1.stack || err_1.message));
                        throw err_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------
    // FETCH METHODS
    // -------------------
    PageContentReader.prototype.fetchHtmlWithFallback = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2, res, fallbackErr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 8]);
                        return [4 /*yield*/, this.fetchPageContentWithFlare(url)];
                    case 1: 
                    // Try Flare first
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        this.log.warn("Flare failed for URL: ".concat(url, ", falling back..."), err_2);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })];
                    case 4:
                        res = _a.sent();
                        if (!res.ok) {
                            throw new Error("Fallback fetch failed with status: ".concat(res.status));
                        }
                        return [4 /*yield*/, res.text()];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6:
                        fallbackErr_1 = _a.sent();
                        this.log.error("Both Flare and fallback failed for URL: ".concat(url), fallbackErr_1);
                        throw fallbackErr_1;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PageContentReader.prototype.fetchPageContentWithFlare = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.post("http://192.168.68.120:6003/v1", {
                            cmd: "request.get",
                            url: url,
                            maxTimeout: 60000,
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.solution.response];
                }
            });
        });
    };
    // -------------------
    // SITE HANDLERS
    // -------------------
    PageContentReader.prototype.getSiteHandler = function (url) {
        var _this = this;
        if (url.includes("novelbin"))
            return this.handleNovelBin.bind(this);
        if (url.includes("dxmwx"))
            return this.handleDXMWX.bind(this);
        if (url.includes("fanmtl"))
            return this.handleFanMTL.bind(this);
        if (url.includes("wtr-lab"))
            return this.handleWTRLab.bind(this);
        if (url.includes("69shuba"))
            return this.handle69shuba.bind(this);
        if (url.includes("royalroad"))
            return this.handleRoyalRoad.bind(this);
        if (url.includes("novel122"))
            return this.handleNovel122.bind(this);
        if (url.includes("wuxiaworld"))
            return this.handleWuxiaWorld.bind(this);
        return function (_xml, _base, lines, spellCorrectEnabled) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        content: lines.join("\n"),
                        nextChapterURL: null,
                    })];
            });
        }); };
    };
    PageContentReader.prototype.handleWuxiaWorld = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var nextChapterURL, links, nextLink, href, contentRaw, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextChapterURL = null;
                        links = Array.from(documentDom.querySelectorAll("a"));
                        nextLink = links.find(function (aElem) {
                            var button = aElem.querySelector("button");
                            var text = ((button === null || button === void 0 ? void 0 : button.textContent) || "").trim().toLowerCase();
                            return text.includes("next chapter");
                        });
                        if (nextLink) {
                            href = nextLink.getAttribute("href");
                            if (href) {
                                try {
                                    nextChapterURL = new URL(href, baseUrl).toString();
                                }
                                catch (_b) {
                                    nextChapterURL = href;
                                }
                            }
                        }
                        contentRaw = lines.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        content = _a.sent();
                        return [2 /*return*/, {
                                content: content,
                                nextChapterURL: nextChapterURL
                            }];
                }
            });
        });
    };
    PageContentReader.prototype.handleNovel122 = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var links, next, href, nextChapterURL, contentRaw, content;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        links = documentDom.querySelectorAll(".chap-select a");
                        next = links.length > 0 ? links[links.length - 1] : null;
                        href = (_a = next === null || next === void 0 ? void 0 : next.getAttribute("href")) !== null && _a !== void 0 ? _a : null;
                        nextChapterURL = href ? new URL(href, baseUrl).toString() : null;
                        contentRaw = lines.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        content = _b.sent();
                        return [2 /*return*/, {
                                content: content,
                                nextChapterURL: nextChapterURL
                            }];
                }
            });
        });
    };
    // Central helper: only refine if enabled, fallback to original if both AI fail.
    PageContentReader.prototype.refineWithFallback = function (text, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var gemini, e_1, ollama, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!spellCorrectEnabled)
                            return [2 /*return*/, text];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.refineWithGemini(text)];
                    case 2:
                        gemini = _a.sent();
                        if (gemini && gemini.trim().length > 0)
                            return [2 /*return*/, gemini];
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.refineWithOllamaNew(text)];
                    case 5:
                        ollama = _a.sent();
                        if (ollama && ollama.trim().length > 0)
                            return [2 /*return*/, ollama];
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, text];
                }
            });
        });
    };
    PageContentReader.prototype.handleRoyalRoad = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var title, contentRaw, refined, nextChapter, href, nextChapterURL;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        title = (_c = (_b = (_a = documentDom.querySelector("div.fic-header h1")) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
                        contentRaw = title + ' \n' + lines.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        refined = _e.sent();
                        nextChapter = Array.from(documentDom.querySelectorAll("a")).find(function (a) {
                            return String(a.textContent || "").trim().toLowerCase().includes("next chapter");
                        });
                        href = (_d = nextChapter === null || nextChapter === void 0 ? void 0 : nextChapter.getAttribute("href")) !== null && _d !== void 0 ? _d : null;
                        nextChapterURL = href ? new URL(href, baseUrl).toString() : null;
                        return [2 /*return*/, {
                                content: refined,
                                nextChapterURL: nextChapterURL
                            }];
                }
            });
        });
    };
    PageContentReader.prototype.handleNovelBin = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var node, contentRaw, content;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        node = documentDom.querySelector("a#next_chap");
                        contentRaw = lines.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        content = _b.sent();
                        return [2 /*return*/, {
                                content: content,
                                nextChapterURL: (_a = node === null || node === void 0 ? void 0 : node.getAttribute("href")) !== null && _a !== void 0 ? _a : null,
                            }];
                }
            });
        });
    };
    PageContentReader.prototype.handleDXMWX = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var filtered, _i, lines_1, line, nextChapterURL, contentRaw, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filtered = [];
                        for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                            line = lines_1[_i];
                            if (line.toLowerCase().includes("tap the screen to use advanced tools tip"))
                                break;
                            filtered.push(line);
                        }
                        return [4 /*yield*/, this.extractDXMWXNext(documentDom, baseUrl)];
                    case 1:
                        nextChapterURL = _a.sent();
                        contentRaw = filtered.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 2:
                        content = _a.sent();
                        return [2 /*return*/, { content: content, nextChapterURL: nextChapterURL }];
                }
            });
        });
    };
    PageContentReader.prototype.handleFanMTL = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var filtered, _i, lines_2, line, contentRaw, content, node, href, nextChapterURL;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        filtered = [];
                        for (_i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
                            line = lines_2[_i];
                            if (line.toLowerCase().includes("YOU'LL ALSO LIKE".toLowerCase()))
                                break;
                            filtered.push(line);
                        }
                        contentRaw = filtered.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        content = _b.sent();
                        node = documentDom.querySelector(".chnav.next");
                        href = (_a = node === null || node === void 0 ? void 0 : node.getAttribute("href")) !== null && _a !== void 0 ? _a : null;
                        nextChapterURL = href ? new URL(href, baseUrl).toString() : null;
                        return [2 /*return*/, { content: content, nextChapterURL: nextChapterURL }];
                }
            });
        });
    };
    PageContentReader.prototype.handle69shuba = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var contentRaw, content, node, nextChapterURL;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        contentRaw = lines.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        content = _b.sent();
                        node = documentDom.querySelector("div.page1 a:nth-of-type(4)");
                        nextChapterURL = (_a = node === null || node === void 0 ? void 0 : node.getAttribute("href")) !== null && _a !== void 0 ? _a : null;
                        return [2 /*return*/, { content: content, nextChapterURL: nextChapterURL }];
                }
            });
        });
    };
    PageContentReader.prototype.handleWTRLab = function (documentDom, baseUrl, lines, spellCorrectEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            function getNextChapterUrl(url) {
                var match = url.match(/(chapter-)(\d+)/i);
                if (match && match[2]) {
                    var currentChapter = parseInt(match[2], 10);
                    var nextChapter = currentChapter + 1;
                    return url.replace(/chapter-\d+/i, "chapter-".concat(nextChapter));
                }
                return null;
            }
            var filtered, _i, lines_3, line, contentRaw, content, nextChapterURL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filtered = [];
                        for (_i = 0, lines_3 = lines; _i < lines_3.length; _i++) {
                            line = lines_3[_i];
                            if (line.toLowerCase().includes("(end of this chapter)") ||
                                line.toLowerCase().includes("tap the screen to use advanced tools tip"))
                                break;
                            filtered.push(line);
                        }
                        contentRaw = filtered.join("\n");
                        return [4 /*yield*/, this.refineWithFallback(contentRaw, spellCorrectEnabled)];
                    case 1:
                        content = _a.sent();
                        nextChapterURL = getNextChapterUrl(baseUrl);
                        return [2 /*return*/, { content: content, nextChapterURL: nextChapterURL }];
                }
            });
        });
    };
    PageContentReader.prototype.extractDXMWXNext = function (documentDom, baseUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var node, href;
            return __generator(this, function (_a) {
                node = documentDom.querySelector("div[onclick='JumpNext();'] > a");
                if (!node)
                    return [2 /*return*/, null];
                href = node.getAttribute("href");
                return [2 /*return*/, (href === null || href === void 0 ? void 0 : href.startsWith("http")) ? href : new URL(href !== null && href !== void 0 ? href : "", baseUrl).toString()];
            });
        });
    };
    // -------------------
    // HELPERS
    // -------------------
    PageContentReader.prototype.getTitleFromUrl = function (url) {
        var lastPart = url.split("/").filter(Boolean).pop() || "Untitled";
        return decodeURIComponent(lastPart)
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    };
    PageContentReader.prototype.removeLinks = function (text) {
        return text.replace(/https?:\/\/[^\s]+/g, "").replace(/www\.[^\s]+/g, "");
    };
    PageContentReader.prototype.sanitizeLines = function (text) {
        return text
            .split("\n")
            .map(function (l) { return l.trim(); })
            .filter(function (l) { return l.length > 0; })
            .filter(function (l) { return !l.toLowerCase().includes("pubfuture"); });
    };
    PageContentReader.prototype.splitIntoThree = function (arr) {
        var size = Math.ceil(arr.length / 3);
        return [arr.slice(0, size), arr.slice(size, 2 * size), arr.slice(2 * size)];
    };
    PageContentReader.prototype.translateLinesWithOllama = function (chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, chunks_1, chunk, translated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.debug("Translating with Ollama...");
                        results = [];
                        _i = 0, chunks_1 = chunks;
                        _a.label = 1;
                    case 1:
                        if (!(_i < chunks_1.length)) return [3 /*break*/, 4];
                        chunk = chunks_1[_i];
                        return [4 /*yield*/, this.callOllama("yi:6b", "\nYou are a professional novel translator. \n- Preserve the tone, style, and emotions of the original.\n- Do not summarize or shorten. Translate every line fully.\n- Translate sentence by sentence, keeping the structure.\n- Do no translate names of people, places, or specific terms.\n- 'High-light' or 'highlight' is not a name, translate it as 'Gao Guang'.\n\nChinese text:\n".concat(chunk.join("\n"), "\n      "))];
                    case 2:
                        translated = _a.sent();
                        results.push(translated);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                }
            });
        });
    };
    PageContentReader.prototype.refineWithOllamaNew = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var refined;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.debug("Refining with Ollama...");
                        return [4 /*yield*/, this.refineWithOllama(this.splitIntoThree(prompt.split("\n")))];
                    case 1:
                        refined = _a.sent();
                        return [2 /*return*/, refined.join("\n\n")];
                }
            });
        });
    };
    PageContentReader.prototype.refineWithOllama = function (chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var results, template, err_3, _i, chunks_2, chunk, translated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.debug("Refining with Ollama...");
                        results = [];
                        template = "";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(path.join("config", "refine_prompt.txt"), "utf8")];
                    case 2:
                        template = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        this.log.error("Failed to read refine_prompt.txt: " + err_3);
                        return [3 /*break*/, 4];
                    case 4:
                        _i = 0, chunks_2 = chunks;
                        _a.label = 5;
                    case 5:
                        if (!(_i < chunks_2.length)) return [3 /*break*/, 8];
                        chunk = chunks_2[_i];
                        return [4 /*yield*/, this.callOllama(null, "\n".concat(template.trim(), "\n\nNovel text:\n").concat(chunk.join("\n"), "\n      "))];
                    case 6:
                        translated = _a.sent();
                        results.push(translated);
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/, results];
                }
            });
        });
    };
    PageContentReader.prototype.callOllamaD = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt];
            });
        });
    };
    // -------------------
    // OLLAMA CALL
    // -------------------
    PageContentReader.prototype.callOllama = function (model, prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!model) {
                            model = "mistral:7b";
                        }
                        this.log.debug("Ollama prompt length: ".concat(prompt.length));
                        return [4 /*yield*/, fetch("http://192.168.68.123:11434/api/generate", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ model: model, prompt: prompt, stream: false }),
                            })];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("Ollama API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _b.sent();
                        this.log.debug("Ollama response received: " + String(data.response).slice(0, 60) + "...");
                        return [2 /*return*/, (_a = data.response) !== null && _a !== void 0 ? _a : ""];
                }
            });
        });
    };
    PageContentReader.prototype.refineWithGemini = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            var template, err_4, fullPrompt, model, maxRetries, retryDelayMs, attempt, response, text, error_1, status_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.log.debug("Refining with Gemini...");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(path.join("config", "refine_prompt.txt"), "utf8")];
                    case 2:
                        template = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_4 = _c.sent();
                        this.log.error("Failed to read refine_prompt.txt: " + err_4);
                        return [2 /*return*/, undefined];
                    case 4:
                        fullPrompt = "".concat(template.trim(), "\n\nNovel text:\n").concat(prompt);
                        this.log.debug("Gemini full prompt length: ".concat(fullPrompt.length));
                        model = "gemini-2.5-flash";
                        model = "gemini-2.5-flash-lite";
                        maxRetries = 1;
                        retryDelayMs = 60 * 1000;
                        attempt = 1;
                        _c.label = 5;
                    case 5:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 14];
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 13]);
                        return [4 /*yield*/, ai.models.generateContent({
                                model: model,
                                contents: fullPrompt,
                            })];
                    case 7:
                        response = _c.sent();
                        // @ts-ignore
                        console.log("Response status - ".concat(response === null || response === void 0 ? void 0 : response.status));
                        console.log("JSON - ".concat(JSON.stringify(response)));
                        text = (_a = response === null || response === void 0 ? void 0 : response.text) === null || _a === void 0 ? void 0 : _a.trim();
                        if (text) {
                            this.log.debug("Gemini refinement successful.");
                            return [2 /*return*/, text];
                        }
                        else {
                            this.log.warn("Empty response from Gemini.");
                        }
                        return [3 /*break*/, 13];
                    case 8:
                        error_1 = _c.sent();
                        status_1 = (error_1 === null || error_1 === void 0 ? void 0 : error_1.status) || ((_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _b === void 0 ? void 0 : _b.status);
                        if (!(status_1 === 503 || status_1 === 429)) return [3 /*break*/, 12];
                        this.log.warn("Gemini returned 503 (attempt ".concat(attempt, "/").concat(maxRetries, "). Retrying in 1 minute..."));
                        if (!(attempt < maxRetries)) return [3 /*break*/, 10];
                        return [4 /*yield*/, new Promise(function (res) { return setTimeout(res, retryDelayMs); })];
                    case 9:
                        _c.sent();
                        return [3 /*break*/, 13];
                    case 10: return [4 /*yield*/, this.refineWithOllamaNew(prompt)];
                    case 11: return [2 /*return*/, _c.sent()];
                    case 12:
                        this.log.error("Gemini refinement failed on attempt ".concat(attempt, ": ").concat(error_1));
                        throw error_1; // Stop if not 503 or after last retry
                    case 13:
                        attempt++;
                        return [3 /*break*/, 5];
                    case 14:
                        this.log.error("Refinement failed after all retries.");
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    PageContentReader.prototype.googleTranslateText = function (text_1) {
        return __awaiter(this, arguments, void 0, function (text, targetLanguage) {
            var BATCH_SIZE, allTranslations, _loop_1, this_1, i, error_2;
            var _this = this;
            if (targetLanguage === void 0) { targetLanguage = 'en'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        this.log.debug("Translating with Google Translate...");
                        BATCH_SIZE = 125;
                        allTranslations = [];
                        _loop_1 = function (i) {
                            var batch, translations;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        batch = text.slice(i, i + BATCH_SIZE);
                                        this_1.log.debug("Translating batch ".concat(Math.floor(i / BATCH_SIZE) + 1, "/").concat(Math.ceil(text.length / BATCH_SIZE), " (").concat(batch.length, " items)..."));
                                        return [4 /*yield*/, translate.translate(batch, targetLanguage)];
                                    case 1:
                                        translations = (_b.sent())[0];
                                        translations = Array.isArray(translations) ? translations : [translations];
                                        // @ts-ignore
                                        translations.forEach(function (translation, j) {
                                            _this.log.debug("GoogleTranslate: \"".concat(batch[j], "\" => \"").concat(translation, "\""));
                                        });
                                        allTranslations.push.apply(allTranslations, translations);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < text.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i += BATCH_SIZE;
                        return [3 /*break*/, 1];
                    case 4:
                        this.log.debug("Total translated items: ".concat(allTranslations.length));
                        return [2 /*return*/, allTranslations];
                    case 5:
                        error_2 = _a.sent();
                        this.log.error('Google Translate ERROR: ' + error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return PageContentReader;
}());
exports.default = PageContentReader;
