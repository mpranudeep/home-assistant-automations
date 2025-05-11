import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { Logger } from '@nestjs/common';
import { convert } from 'html-to-text';
import puppeteer from 'puppeteer';
import { DOMParser as XmlDomParser } from 'xmldom'; // use xmldom parser, not JSDOM here
import xpath from 'xpath';

export default class PageContentReader {
  private log = new Logger(PageContentReader.name);

  private getTitleFromUrl(url: string): string {
    const parts = url.split('/');
    let lastPart = parts.filter(Boolean).pop() || 'Untitled';
    return decodeURIComponent(lastPart)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  public async getReadableContent(url: string): Promise<{ title: string; content: string, nextChapterURL:string|undefined|null }> {
    try {
      const html = await this.fetchPageContentWithPuppeteer(url);

     const xmlDom = new XmlDomParser({
        
      }).parseFromString(html);

      const select = xpath.useNamespaces({ x: 'http://www.w3.org/1999/xhtml' });

      // @ts-ignore
      const nextNode= select(
        "//a[@id='next_chap']",
        xmlDom
      )[0]
      
      console.log('Next Chapter node - '+nextNode?.getAttribute('href'));

      let nextChapterURL = nextNode?.getAttribute('href');
      
      // ?.getAttribute('href');


      const dom = new JSDOM(html, { url });
      
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.content) {
        throw new Error('Could not parse article.');
      }

      const title = article.title?.trim() || this.getTitleFromUrl(url);
      const plainText = convert(article.content, { wordwrap: false });

      this.log.debug(`Title: ${title}`);
      this.log.debug(`Content length: ${plainText.length} chars`);
      // this.log.debug(`${plainText}`);

      return { title, 
                content: plainText ,
                nextChapterURL : nextChapterURL
              };
    } catch (err) {
    // @ts-ignore
      this.log.error(`Error scraping content from ${url}:`, err.stack || err.message);
      throw err;
    }
  }

  private async fetchPageContentWithPuppeteer(url: string): Promise<string> {
   // @ts-ignore
    const browser = await puppeteer.launch({ headless: 'new', executablePath: '/usr/bin/chromium' ,  args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const content = await page.content();
    await browser.close();
    return content;
  }
}
