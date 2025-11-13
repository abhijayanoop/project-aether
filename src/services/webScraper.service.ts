import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../config/logger';

export class WebScraperService {
  async scrapeUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);
      $('script, style, nav, footer, iframe').remove();

      let content = '';
      const selectors = ['article', 'main', '.content', '#content'];

      for (const selector of selectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text();
          break;
        }
      }

      if (!content) {
        content = $('p')
          .map((i, el) => $(el).text())
          .get()
          .join('\n\n');
      }

      content = content.replace(/\s+/g, ' ').trim();

      logger.info('URL scraped', { url, length: content.length });
      return content;
    } catch (error) {
      logger.error('Web scraping failed:', error);
      throw new Error('Failed to scrape URL');
    }
  }
}

export const webScraperService = new WebScraperService();
