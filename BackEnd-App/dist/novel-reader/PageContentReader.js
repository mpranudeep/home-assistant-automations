"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const readability_1 = require("@mozilla/readability");
const common_1 = require("@nestjs/common");
const html_to_text_1 = require("html-to-text");
const puppeteer_1 = __importDefault(require("puppeteer"));
class PageContentReader {
    constructor() {
        this.log = new common_1.Logger(PageContentReader.name);
    }
    getTitleFromUrl(url) {
        const parts = url.split('/');
        let lastPart = parts.filter(Boolean).pop() || 'Untitled';
        return decodeURIComponent(lastPart)
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    async getReadableContent(url) {
        try {
            const html = await this.fetchPageContentWithPuppeteer(url);
            const dom = new jsdom_1.JSDOM(html, { url });
            const reader = new readability_1.Readability(dom.window.document);
            const article = reader.parse();
            if (!article || !article.content) {
                throw new Error('Could not parse article.');
            }
            const title = article.title?.trim() || this.getTitleFromUrl(url);
            const plainText = (0, html_to_text_1.convert)(article.content, { wordwrap: false });
            this.log.debug(`Title: ${title}`);
            this.log.debug(`Content length: ${plainText.length} chars`);
            this.log.debug(`${plainText}`);
            return { title, content: plainText };
        }
        catch (err) {
            // @ts-ignore
            this.log.error(`Error scraping content from ${url}:`, err.stack || err.message);
            throw err;
        }
    }
    async fetchPageContentWithPuppeteer(url) {
        // @ts-ignore
        const browser = await puppeteer_1.default.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        const content = await page.content();
        await browser.close();
        return content;
    }
}
exports.default = PageContentReader;
