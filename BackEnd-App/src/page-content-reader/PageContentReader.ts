import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { Logger } from '@nestjs/common';
import { convert } from 'html-to-text';
import puppeteer from 'puppeteer';
import { DOMParser as XmlDomParser } from 'xmldom'; // use xmldom parser, not JSDOM here
import xpath from 'xpath';
import * as os from 'os';
import { Browser, computeExecutablePath } from '@puppeteer/browsers';
import { cp } from 'fs';



export default class PageContentReader {
  private log = new Logger(PageContentReader.name);

  private getTitleFromUrl(url: string): string {
    const parts = url.split('/');
    let lastPart = parts.filter(Boolean).pop() || 'Untitled';
    return decodeURIComponent(lastPart)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private removeLinks(input: string): string {
    return input.replace(
      /https?:\/\/[^\s]+/g,
      ''
    ).replace(
      /www\.[^\s]+/g,
      ''
    );
  }

  public async getReadableContent(url: string): Promise<{ title: string; content: string, nextChapterURL: string | undefined | null }> {
    try {
      const html = await this.fetchPageContentWithPuppeteer(url);

      const xmlDom = new XmlDomParser({

      }).parseFromString(html);

      const select = xpath.useNamespaces({ x: 'http://www.w3.org/1999/xhtml' });

      // @ts-ignore
      const nextNode = select(
        "//a[@id='next_chap']",
        xmlDom
      )[0]

      console.log('Next Chapter node - ' + nextNode?.getAttribute('href'));

      let nextChapterURL = nextNode?.getAttribute('href');

      // ?.getAttribute('href');


      const dom = new JSDOM(html, { url });

      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.content) {
        throw new Error('Could not parse article.');
      }

      const title = article.title?.trim() || this.getTitleFromUrl(url);
      let plainText = convert(article.content, { wordwrap: false });

      plainText = this.removeLinks(plainText);
      
      this.log.debug(`Title: ${title}`);
      this.log.debug(`Content length: ${plainText.length} chars`);
      // this.log.debug(`${plainText}`);

      return {
        title,
        content: plainText,
        nextChapterURL: nextChapterURL
      };
    } catch (err) {
      // @ts-ignore
      this.log.error(`Error scraping content from ${url}:`, err.stack || err.message);
      throw err;
    }
  }

  private async fetchPageContentWithPuppeteer(url: string): Promise<string> {

    const isWindows = os.platform() === 'win32';


    let executablePath = undefined;
    let args: string[] = [];

    if (!isWindows) {
      // executablePath = '/usr/bin/chromium';
      args = ['--no-sandbox', '--disable-setuid-sandbox']
    }

    //  executablePath = await computeExecutablePath({ browser: Browser.CHROME, cacheDir:"./chrome",buildId:"stable"});
    // @ts-ignore
    const browser = await puppeteer.launch({ headless: true, executablePath: executablePath, args: args });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    
    try {
      // await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000, // timeout in ms
      });
    } catch (err) {
      // @ts-ignore
      console.warn(`Page load timeout after 30000 ms:`, err.message);
    }

    const content = await page.content();
    await browser.close();
    return content;
  }
}
