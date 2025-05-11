import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { convert } from 'html-to-text';

export default class PageContentReader{

    private log = new Logger(PageContentReader.name);

    getTitleFromUrl(url: string): string {
      const parts = url.split('/');
      let lastPart = parts.filter(Boolean).pop() || 'Untitled';
    
      // Replace dashes/underscores with spaces and capitalize
      lastPart = decodeURIComponent(lastPart)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    
      return lastPart;
    }

    async getReadableContent(url: string): Promise<{ title: string; content: string }> {
        const response = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
        });
        const dom = new JSDOM(response.data, { url }); // Important to include the URL
      
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
      
        if (!article) {
          throw new Error('Could not parse article.');
        }

        
        this.log.debug(`Tilte - ${article.title}`);

        

        if(article.title && article.content){
          let title = this.getTitleFromUrl(url);
          const plainText = convert(article.content);
          this.log.debug(`Content - ${plainText}`);
          return {
            title: title,
            content: plainText, // This is cleaned HTML
          };
        }else{
          throw new Error('Can not read page');
        }
      }
}

