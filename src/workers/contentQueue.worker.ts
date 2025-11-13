import logger from '../config/logger';
import contentQueue from '../config/queue';
import { contentService } from '../services/content.service';
import { pdfExtractorService } from '../services/pdfExtractor.service';
import { webScraperService } from '../services/webScraper.service';
import { youtubeTranscriptService } from '../services/youtubeTranscript.service';

contentQueue.process('process-content', async (job) => {
  const { contentId, type, sourceUrl } = job;

  logger.info(`Processing ${contentId} (${type})`);

  try {
    await contentService.updateStatus(contentId, 'processing');

    let extractedText = '';

    switch (type) {
      case 'pdf':
        extractedText = await pdfExtractorService.extractText(sourceUrl);
        break;
      case 'url':
        extractedText = await webScraperService.scrapeUrl(sourceUrl);
        break;
      case 'youtube':
        extractedText =
          await youtubeTranscriptService.fetchTranscript(sourceUrl);
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    await contentService.updateContent(contentId, extractedText);
    await contentService.updateStatus(contentId, 'completed');

    logger.info(`✅ Content processed: ${contentId}`);
    return { success: true, length: extractedText.length };
  } catch (error) {
    logger.error(`Processing content for ${contentId} failed`, error);
    await contentService.updateStatus(contentId, 'failed');
    throw error;
  }
});
