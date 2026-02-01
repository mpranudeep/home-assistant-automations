import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { Logger } from "@nestjs/common";
import { convert } from "html-to-text";
import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";
import { DOMParser as XmlDomParser } from "xmldom";
import xpath from "xpath";
import * as os from "os";
import axios from "axios";
import { SimpleCache } from "../common/SimpleCache";
import { GoogleGenAI } from "@google/genai";
import { promises as fs } from "fs";
import dotenv from 'dotenv';
import * as cheerio from "cheerio";

dotenv.config();

const { Translate } = require('@google-cloud/translate').v2;
const path = require('path');

// Set the path relative to your script's location
const keyPath = path.join('src', 'google_key.json');


const translate = new Translate({key:process.env.AC_MP_GOOGLE_API_KEY});

const ai = new GoogleGenAI({apiKey:process.env.AC_HK_GOOGLE_API_KEY});

const contentCache = new SimpleCache<{
  title: string;
  content: string;
  nextChapterURL: string | null | undefined;
}>(1000 * 60 * 60, "rundata/cache");



export default class PageContentReader {
  private log = new Logger(PageContentReader.name);
  private browser: Browser | null = null;
  private page: Page | null = null;
  private browserInUse = false;
  private browserCloseTimeout: NodeJS.Timeout | null = null;

  // -------------------
  // INITIALIZATION & CLEANUP
  // -------------------
  private async initializeBrowser() {
    if (this.browser && this.page) {
      this.browserInUse = true;
      if (this.browserCloseTimeout) {
        clearTimeout(this.browserCloseTimeout);
        this.browserCloseTimeout = null;
      }
      return;
    }

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
    this.browserInUse = true;
  }

  private async releaseBrowser() {
    this.browserInUse = false;
    // Only close after a period of inactivity (prevent accidental rapid open/close)
    if (this.browserCloseTimeout) clearTimeout(this.browserCloseTimeout);
    this.browserCloseTimeout = setTimeout(async () => {
      try {
        if (this.browser) {
          await this.browser.close();
          this.browser = null;
          this.page = null;
        }
      } catch (e: any) {
        this.log.warn("Failed to close Puppeteer browser cleanly: " + (e.stack || e.message));
      }
    }, 120000); // 2 minutes inactivity timeout
  }

  // -------------------
  // PUBLIC ENTRYPOINT
  // -------------------
  /**
   * Main entrypoint. Returns processed content for a URL, with optional spell correction.
   * @param url - The URL of the page to read
   * @param spellCorrectEnabled - Whether to run AI spell/grammar correction
   */
  public async getReadableContent(url: string, spellCorrectEnabled: boolean = false) {
    if (!url || typeof url !== "string" || !/^https?:\/\//.test(url)) {
      this.log.warn("Invalid or missing URL input to getReadableContent");
      throw new Error("Invalid or missing URL. Must be a valid http(s) URL.");
    }
    const cacheKey = `${url}|${!!spellCorrectEnabled}`;
    const cached = contentCache.get(cacheKey);
    if (cached) {
      this.log.debug(`Cache hit for ${url} [spellCorrect=${spellCorrectEnabled}]`);
      return cached;
    }

    const result = await this.scrapeAndProcessContent(url, spellCorrectEnabled);
    contentCache.set(cacheKey, result);
    return result;
  }

  // -------------------
  // SCRAPING + PARSING
  // -------------------
  private async scrapeAndProcessContent(url: string, spellCorrectEnabled: boolean = false) {
    try {
      let title: string;
      let lines: string[] = [];
      let xmlDom: any;

      if (url.includes("wtr-lab.com")) {
        // Extract identifiers
        const match = url.match(/\/novel\/(\d+)\/[^/]+\/chapter-(\d+)/i);

        if (!match) {
          throw new Error("Invalid wtr-lab URL format");
        }

        const rawId = parseInt(match[1], 10);
        const chapterNo = parseInt(match[2], 10);
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
      const { content, nextChapterURL } = await siteHandler(xmlDom, url, lines, spellCorrectEnabled);

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
      return await this.page!.content();
    } catch (err: any) {
      this.log.warn(`Puppeteer error/navigator timeout: ${err.message}`);
      throw err;
    } finally {
      // Release browser for idle-close
      await this.releaseBrowser();
    }
  }

  // -------------------
  // SITE HANDLERS
  // -------------------
  private getSiteHandler(
    url: string
  ): (
    xmlDom: any,
    baseUrl: string,
    lines: string[],
    spellCorrectEnabled: boolean
  ) => Promise<{ content: string; nextChapterURL: string | null | undefined }> {
    if (url.includes("novelbin")) return this.handleNovelBin.bind(this);
    if (url.includes("dxmwx")) return this.handleDXMWX.bind(this);
    if (url.includes("fanmtl")) return this.handleFanMTL.bind(this);
    if (url.includes("wtr-lab")) return this.handleWTRLab.bind(this);
    if (url.includes("69shuba")) return this.handle69shuba.bind(this);
    if (url.includes("royalroad")) return this.handleRoyalRoad.bind(this);
    if (url.includes("novel122")) return this.handleNovel122.bind(this);
    if (url.includes("wuxiaworld")) return this.handleWuxiaWorld.bind(this);
    return async (_xml, _base, lines, spellCorrectEnabled) => ({
      content: lines.join("\n"),
      nextChapterURL: null,
    });
  }

  private async handleWuxiaWorld(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    // Use XPath to locate <a> with a child <button> whose text contains "next chapter" (case-insensitive)
    let nextChapterURL: string | null = null;

    // XPath: find <a> with a <button> descendant (or child) whose normalized text contains "next chapter" (case-insensitive)
    // 1. Select all <a> elements with descendant <button> whose normalized text matches
    // 2. Prefer descendant to allow nested buttons

    // This XPath checks buttons that are descendants for broader matching
    const nodes = xpath.select(
      "//a[.//button[contains(translate(normalize-space(string(.)), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next chapter')]]",
      xmlDom
    ) as any[];

    if (nodes && nodes.length > 0) {
      const aElem = nodes[0];
      const href = aElem.getAttribute("href");
      if (href) {
        try {
          nextChapterURL = new URL(href, baseUrl).toString();
        } catch {
          nextChapterURL = href;
        }
      }
    }

    let contentRaw = lines.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);

    return {
      content,
      nextChapterURL
    };
  }

   private async handleNovel122(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    const $ = cheerio.load(xmlDom.toString());
    const next = $(".chap-select a").last();
    const href = next.attr("href");
    const nextChapterURL = href ? new URL(href, baseUrl).toString() : null;
    let contentRaw = lines.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);
    return {
      content: content,
      nextChapterURL: nextChapterURL
    };
   }

  // Central helper: only refine if enabled, fallback to original if both AI fail.
  private async refineWithFallback(text: string, spellCorrectEnabled: boolean): Promise<string> {
    if (!spellCorrectEnabled) return text;
    try {
      const gemini = await this.refineWithGemini(text);
      if (gemini && gemini.trim().length > 0) return gemini;
    } catch (e) {
      // continue to ollama fallback
    }
    try {
      const ollama = await this.refineWithOllamaNew(text);
      if (ollama && ollama.trim().length > 0) return ollama;
    } catch (e) {
      // final fallback
    }
    return text;
  }

  private async handleRoyalRoad(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    const title = xpath.select1("//div[contains(@class, \"fic-header\")]//h1", xmlDom) as any;
    let contentRaw =  title.textContent.trim() + ' \n' + lines.join("\n");
    let refined = await this.refineWithFallback(contentRaw, spellCorrectEnabled);

    let nextChapter = xpath.select1("//a[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next chapter')]",xmlDom) as any;
    const href = nextChapter?.getAttribute("href") ?? null;
    const nextChapterURL = href ? new URL(href, baseUrl).toString() : null;

    return {
      content: refined,
      nextChapterURL: nextChapterURL
    };
  }



  private async handleNovelBin(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    const node = xpath.select1("//a[@id='next_chap']", xmlDom) as any;
    let contentRaw = lines.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);
    return {
      content: content,
      nextChapterURL: node?.getAttribute("href") ?? null,
    };
  }

  private async handleDXMWX(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    let filtered = [];
    for (const line of lines) {
      if (line.toLowerCase().includes("tap the screen to use advanced tools tip"))
        break;
      filtered.push(line);
    }
    const nextChapterURL = await this.extractDXMWXNext(xmlDom, baseUrl);
    let contentRaw = filtered.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);
    return { content, nextChapterURL };
  }

  private async handleFanMTL(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    let filtered = [];
    for (const line of lines) {
      if (line.toLowerCase().includes("YOU'LL ALSO LIKE".toLowerCase())) break;
      filtered.push(line);
    }
    let contentRaw = filtered.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);
    const node = xpath.select1(
      "//*[contains(@class, 'chnav') and contains(@class, 'next')]",
      xmlDom
    ) as any;
    const href = node?.getAttribute("href") ?? null;
    const nextChapterURL = href ? new URL(href, baseUrl).toString() : null;
    return { content, nextChapterURL };
  }

  private async handle69shuba(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    let contentRaw = lines.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);
    const node = xpath.select1("//div[@class='page1']/a[4]", xmlDom) as any;
    const nextChapterURL = node?.getAttribute("href") ?? null;
    return { content, nextChapterURL };
  }

  private async handleWTRLab(xmlDom: any, baseUrl: string, lines: string[], spellCorrectEnabled: boolean) {
    let filtered = [];
    for (const line of lines) {
      if (
        line.toLowerCase().includes("(end of this chapter)") ||
        line.toLowerCase().includes("tap the screen to use advanced tools tip")
      )
        break;
      filtered.push(line);
    }
    let contentRaw = filtered.join("\n");
    let content = await this.refineWithFallback(contentRaw, spellCorrectEnabled);

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
    return { content, nextChapterURL };
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
    this.log.debug("Translating with Ollama...");
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

  private async refineWithOllamaNew(prompt: string): Promise<string> {
    this.log.debug("Refining with Ollama...");
    let refined = await this.refineWithOllama(this.splitIntoThree(prompt.split("\n")));
    return refined.join("\n\n");
  }

  private async refineWithOllama(chunks: string[][]): Promise<string[]> {
    this.log.debug("Refining with Ollama...");
    const results: string[] = [];
    let template: string="";
      try {
      template = await fs.readFile(path.join("config","refine_prompt.txt"), "utf8");
    } catch (err) {
      this.log.error("Failed to read refine_prompt.txt: " + err);
    }

    for (const chunk of chunks) {
      const translated = await this.callOllama(null, `
${template.trim()}

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
    this.log.debug("Ollama response received: " + String(data.response).slice(0, 60) + "...");
    return data.response ?? "";
  }



  async refineWithGemini(prompt: string): Promise<string | undefined> {
    this.log.debug("Refining with Gemini...");

    // Read the prompt template from a file
    let template: string;
    try {
      template = await fs.readFile(path.join("config","refine_prompt.txt"), "utf8");
    } catch (err) {
      this.log.error("Failed to read refine_prompt.txt: " + err);
      return undefined;
    }

    // Replace placeholder or append novel text
    const fullPrompt = `${template.trim()}\n\nNovel text:\n${prompt}`;

    this.log.debug(`Gemini full prompt length: ${fullPrompt.length}`);

    let model = "gemini-2.5-flash"; // default to flash; can switch to pro if needed

    model = "gemini-2.5-flash-lite";

    const maxRetries = 1;
    const retryDelayMs = 60 * 1000; // 1 minute

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt,
        });
        // @ts-ignore
        console.log(`Response status - ${response?.status}`);
        
        console.log(`JSON - ${JSON.stringify(response)}`);

        const text = response?.text?.trim();
        if (text) {
          this.log.debug("Gemini refinement successful.");
          return text;
        } else {
          this.log.warn("Empty response from Gemini.");
        }

      } catch (error: any) {
        const status = error?.status || error?.response?.status;

        if (status === 503 || status === 429) {
          this.log.warn(`Gemini returned 503 (attempt ${attempt}/${maxRetries}). Retrying in 1 minute...`);
          if (attempt < maxRetries) {
            await new Promise(res => setTimeout(res, retryDelayMs));
            continue;
          }

          return await this.refineWithOllamaNew(prompt);
        }

        this.log.error(`Gemini refinement failed on attempt ${attempt}: ${error}`);
        throw error; // Stop if not 503 or after last retry
      }
    }

    this.log.error("Refinement failed after all retries.");
    return undefined;
  }


  async googleTranslateText(text: string[], targetLanguage = 'en'): Promise<string[] | undefined> {
    try {
      this.log.debug("Translating with Google Translate...");

      const BATCH_SIZE = 125;
      const allTranslations: string[] = [];

      for (let i = 0; i < text.length; i += BATCH_SIZE) {
        const batch = text.slice(i, i + BATCH_SIZE);
        this.log.debug(`Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(text.length / BATCH_SIZE)} (${batch.length} items)...`);

        let [translations] = await translate.translate(batch, targetLanguage);
        translations = Array.isArray(translations) ? translations : [translations];

        // @ts-ignore
        translations.forEach((translation, j) => {
          this.log.debug(`GoogleTranslate: "${batch[j]}" => "${translation}"`);
        });

        allTranslations.push(...translations);
      }

      this.log.debug(`Total translated items: ${allTranslations.length}`);
      return allTranslations;
    } catch (error) {
      this.log.error('Google Translate ERROR: ' + error);
    }
  }


}
