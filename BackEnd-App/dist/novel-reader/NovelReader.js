"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const readability_1 = require("@mozilla/readability");
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@nestjs/common");
const html_to_text_1 = require("html-to-text");
class NovelReader {
    constructor() {
        this.log = new common_1.Logger(NovelReader.name);
    }
    getTitleFromUrl(url) {
        const parts = url.split('/');
        let lastPart = parts.filter(Boolean).pop() || 'Untitled';
        // Replace dashes/underscores with spaces and capitalize
        lastPart = decodeURIComponent(lastPart)
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        return lastPart;
    }
    async getReadableContent(url) {
        const response = await axios_1.default.get(url);
        const dom = new jsdom_1.JSDOM(response.data, { url }); // Important to include the URL
        const reader = new readability_1.Readability(dom.window.document);
        const article = reader.parse();
        if (!article) {
            throw new Error('Could not parse article.');
        }
        this.log.debug(`Tilte - ${article.title}`);
        if (article.title && article.content) {
            let title = this.getTitleFromUrl(url);
            const plainText = (0, html_to_text_1.convert)(article.content);
            this.log.debug(`Content - ${plainText}`);
            return {
                title: title,
                content: plainText, // This is cleaned HTML
            };
        }
        else {
            throw new Error('Can not read page');
        }
    }
}
exports.default = NovelReader;
