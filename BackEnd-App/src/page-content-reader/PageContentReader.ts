import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { Logger } from "@nestjs/common";
import { convert } from "html-to-text";
import puppeteer from "puppeteer";
import { DOMParser as XmlDomParser } from "xmldom";
import xpath from "xpath";
import * as os from "os";
import axios from "axios";
import { SimpleCache } from "../common/SimpleCache";

const { Translate } = require('@google-cloud/translate').v2;
const path = require('path');

// Set the path relative to your script's location
const keyPath = path.join('src','google_key.json');

const translate = new Translate({
  keyFilename: keyPath,
  projectId: 'deployment-69423'
});

const contentCache = new SimpleCache<{
  title: string;
  content: string;
  nextChapterURL: string | null | undefined;
}>(1000 * 60 * 60, "rundata/cache");

export default class PageContentReader {
  private log = new Logger(PageContentReader.name);
  // @ts-ignore
  private browser: puppeteer.Browser | null = null;
  // @ts-ignore
  private page: puppeteer.Page | null = null;

  // -------------------
  // INITIALIZATION
  // -------------------
  private async initializeBrowser() {
    if (this.browser) return;

    const isWindows = os.platform() === "win32";
    let executablePath: string | undefined = undefined;
    let args: string[] = [];

    if (!isWindows) {
      executablePath = "/usr/bin/chromium";
      args = ["--no-sandbox", "--disable-setuid-sandbox"];
    }

    this.browser = await puppeteer.launch({
      headless: false,
      executablePath,
      args,
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120.0.0.0 Safari/537.36"
    );
  }

  // -------------------
  // PUBLIC ENTRYPOINT
  // -------------------
  public async getReadableContent(url: string) {
    const cached = contentCache.get(url);
    if (cached) {
      this.log.debug(`Cache hit for ${url}`);
      return cached;
    }

    const result = await this.scrapeAndProcessContent(url);
    contentCache.set(url, result);
    return result;
  }

  // -------------------
  // SCRAPING + PARSING
  // -------------------
  private async scrapeAndProcessContent(url: string) {
    try {
      let title: string;
      let lines: string[] = [];
      let xmlDom: any;

      if (url.includes("wtr-lab.com")) {
        // Extract identifiers
        const match = url.match(/serie-(\d+)\/([^/]+)\/chapter-(\d+)/i);
        if (!match) {
          throw new Error("Invalid wtr-lab URL format");
        }

        const rawId = parseInt(match[1], 10);
        const chapterNo = parseInt(match[3], 10);
        const payload = {
          translate: "web",
          language: "en",
          raw_id: rawId,
          chapter_no: chapterNo,
          retry: false,
          force_retry: false,
        };

        const response = await fetch("https://wtr-lab.com/api/reader/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`wtr-lab API failed: ${response.statusText}`);
        }

        const data = await response.json();
        lines = data?.data?.data?.body ?? [];
        title = `Chapter ${chapterNo}`;

        // Minimal XML DOM to keep handler consistent
        xmlDom = new XmlDomParser().parseFromString("<root></root>");
      } else {
        // Default scraping fallback
        const html = await this.fetchHtmlWithFallback(url);
        xmlDom = new XmlDomParser().parseFromString(html);
        const dom = new JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article?.content) {
          throw new Error("Could not parse article content.");
        }

        title = article.title?.trim() || this.getTitleFromUrl(url);
        const plainText = this.removeLinks(
          convert(article.content, { wordwrap: false })
        );
        lines = this.sanitizeLines(plainText);
      }

      // ✅ Unified handler
      const siteHandler = this.getSiteHandler(url);
      const { content, nextChapterURL } = await siteHandler(xmlDom, url, lines);

      this.log.debug(`Title: ${title}`);
      this.log.debug(`Content length: ${content.length} chars`);

      return { title, content, nextChapterURL };
    } catch (err: any) {
      this.log.error(`Error scraping ${url}: ${err.stack || err.message}`);
      throw err;
    }
  }



  // -------------------
  // FETCH METHODS
  // -------------------
  private async fetchHtmlWithFallback(url: string): Promise<string> {
    try {
      // Try Flare first
      return await this.fetchPageContentWithFlare(url);
    } catch (err) {
      this.log.warn(`Flare failed for URL: ${url}, falling back...`, err);

      try {
        // Fallback to plain fetch
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) {
          throw new Error(`Fallback fetch failed with status: ${res.status}`);
        }
        return await res.text();
      } catch (fallbackErr) {
        this.log.error(`Both Flare and fallback failed for URL: ${url}`, fallbackErr);
        throw fallbackErr;
      }
    }
  }


  private async fetchPageContentWithFlare(url: string): Promise<string> {
    const response = await axios.post("http://192.168.68.120:6003/v1", {
      cmd: "request.get",
      url,
      maxTimeout: 60000,
    });
    return response.data.solution.response;
  }

  private async fetchPageContentWithPuppeteer(url: string): Promise<string> {
    await this.initializeBrowser();
    try {
      await this.page!.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
    } catch (err: any) {
      this.log.warn(`Puppeteer timeout: ${err.message}`);
    }
    return await this.page!.content();
  }

  // -------------------
  // SITE HANDLERS
  // -------------------
  private getSiteHandler(
    url: string
  ): (
    xmlDom: any,
    baseUrl: string,
    lines: string[]
  ) => Promise<{ content: string; nextChapterURL: string | null | undefined }> {
    if (url.includes("novelbin")) return this.handleNovelBin.bind(this);
    if (url.includes("dxmwx")) return this.handleDXMWX.bind(this);
    if (url.includes("fanmtl")) return this.handleFanMTL.bind(this);
    if (url.includes("wtr-lab")) return this.handleWTRLab.bind(this);
    return async (_xml, _base, lines) => ({
      content: lines.join("\n"),
      nextChapterURL: null,
    });
  }

  private async handleNovelBin(xmlDom: any) {
    const node = xpath.select1("//a[@id='next_chap']", xmlDom) as any;
    return {
      content: "", // raw lines already handled by readability
      nextChapterURL: node?.getAttribute("href") ?? null,
    };
  }

  private async handleDXMWX(xmlDom: any, baseUrl: string, lines: string[]) {
    let filtered = [];
    for (const line of lines) {
      if (line.toLowerCase().includes("tap the screen to use advanced tools tip"))
        break;
      filtered.push(line);
    }

    const nextChapterURL = await this.extractDXMWXNext(xmlDom, baseUrl);
    const segments = this.splitIntoThree(filtered);
    const translated = await this.refineWithOllama(segments);

    return { content: translated.join("\n"), nextChapterURL };
  }

  private async handleFanMTL(xmlDom: any, baseUrl: string, lines: string[]) {
    let filtered = [];
    for (const line of lines) {
      if (
        line.toLowerCase().includes("(end of this chapter)") ||
        line.toLowerCase().includes("tap the screen to use advanced tools tip")
      )
        break;
      filtered.push(line);
    }

    const segments = this.splitIntoThree(filtered);

    const translated = await this.refineWithOllama(segments);

    const node = xpath.select1(
      "//*[contains(@class, 'chnav') and contains(@class, 'next')]",
      xmlDom
    ) as any;

    const href = node?.getAttribute("href") ?? null;
    const nextChapterURL = href ? new URL(href, baseUrl).toString() : null;

    return { content: translated.join("\n\n"), nextChapterURL };
  }

  private async handleWTRLab(xmlDom: any, baseUrl: string, lines: string[]) {
    let filtered = [];
    for (const line of lines) {
      if (
        line.toLowerCase().includes("(end of this chapter)") ||
        line.toLowerCase().includes("tap the screen to use advanced tools tip")
      )
        break;
      filtered.push(line);
    }

    const segments = this.splitIntoThree(filtered);

    // let translated = await this.translateLinesWithOllama(segments);

    let translated = await this.googleTranslateText(segments.flat());

    if(translated === undefined) {
      throw new Error("Google Translate failed");
    }

    const nsegments = this.splitIntoThree(translated);

    let refined = await this.refineWithOllama(nsegments);

    function getNextChapterUrl(url: string): string | null {
      const match = url.match(/(chapter-)(\d+)/i);
      if (match && match[2]) {
        const currentChapter = parseInt(match[2], 10);
        const nextChapter = currentChapter + 1;
        return url.replace(/chapter-\d+/i, `chapter-${nextChapter}`);
      }
      return null;
    }


    const nextChapterURL = getNextChapterUrl(baseUrl);

    return { content: refined.join("\n\n"), nextChapterURL };
  }

  private async extractDXMWXNext(xmlDom: any, baseUrl: string) {
    const nodes = xpath.select("//div[@onclick='JumpNext();']/a", xmlDom) as any[];
    if (!nodes?.length) return null;

    const href = nodes[0]?.getAttribute("href");
    return href?.startsWith("http") ? href : new URL(href ?? "", baseUrl).toString();
  }

  // -------------------
  // HELPERS
  // -------------------
  private getTitleFromUrl(url: string): string {
    const lastPart = url.split("/").filter(Boolean).pop() || "Untitled";
    return decodeURIComponent(lastPart)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private removeLinks(text: string): string {
    return text.replace(/https?:\/\/[^\s]+/g, "").replace(/www\.[^\s]+/g, "");
  }

  private sanitizeLines(text: string): string[] {
    return text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  private splitIntoThree<T>(arr: T[]): [T[], T[], T[]] {
    const size = Math.ceil(arr.length / 3);
    return [arr.slice(0, size), arr.slice(size, 2 * size), arr.slice(2 * size)];
  }

  private async translateLinesWithOllama(chunks: string[][]): Promise<string[]> {
    console.log("Translating with Ollama...");
    const results: string[] = [];
    for (const chunk of chunks) {
      const translated = await this.callOllama("yi:6b", `
You are a professional novel translator. 
- Preserve the tone, style, and emotions of the original.
- Do not summarize or shorten. Translate every line fully.
- Translate sentence by sentence, keeping the structure.
- Do no translate names of people, places, or specific terms.
- 'High-light' or 'highlight' is not a name, translate it as 'Gao Guang'.

Chinese text:
${chunk.join("\n")}
      `);
      results.push(translated);
    }
    return results;
  }

  private async refineWithOllama(chunks: string[][]): Promise<string[]> {
    console.log("Refining with Ollama...");
    const results: string[] = [];
    for (const chunk of chunks) {
      const translated = await this.callOllama(null, `
You are a professional novel refiner. 
- Correct grammar, improve flow, and enhance readability.
- Do not summarize or shorten. Refine and keep every line fully.
- Keep the English simple and clear.

Novel text:
${chunk.join("\n")}
      `);
      results.push(translated);
    }
    return results;
  }


  async callOllamaD(prompt: string) {
    return prompt;
  }
  // -------------------
  // OLLAMA CALL
  // -------------------
  async callOllama(model: string | undefined | null, prompt: string) {
    if (!model) {
      model = "mistral:7b"
    }
    this.log.debug(`Ollama prompt length: ${prompt.length}`);
    const response = await fetch("http://192.168.68.123:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: model, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Response -`);
    console.log(data.response);
    return data.response ?? "";
  }

  async googleTranslateText(text: string[], targetLanguage = 'en'): Promise<string[] | undefined> {
    try {
      let [translations] = await translate.translate(text, targetLanguage);
      translations = Array.isArray(translations) ? translations : [translations];

      console.log('Translations:');
      // @ts-ignore
      translations.forEach((translation, i) => {
        console.log(`${text[i]} => ${translation}`);
      });
      return translations;
    } catch (error) {
      console.error('ERROR:', error);
    }
  }

}
