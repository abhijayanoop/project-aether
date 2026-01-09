import contentQueue from '../config/queue';
import { contentService } from '../services/content.service';
import { pdfExtractorService } from '../services/pdfExtractor.service';
import { webScraperService } from '../services/webScraper.service';
import { youtubeTranscriptService } from '../services/youtubeTranscript.service';
import logger from '../config/logger';

// Process content jobs
contentQueue.process('process-content', async (job) => {
  const { contentId, type, sourceUrl } = job.data;

  logger.info(`Processing ${contentId} (${type})`);

  // Validate job data
  if (!contentId || !type || !sourceUrl) {
    logger.error('Invalid job data:', job.data);
    throw new Error('Invalid job data: missing contentId, type, or sourceUrl');
  }

  try {
    // Update status to processing
    await contentService.updateStatus(contentId, 'processing');

    let extractedText = '';

    // Extract based on type
    switch (type) {
      // case 'pdf':
      //   extractedText = await pdfExtractorService.extractText(sourceUrl);
      //   break;

      case 'pdf': {
        const fs = await import('fs');

        const pdfBuffer = fs.readFileSync(sourceUrl); // ← Buffer
        extractedText = await pdfExtractorService.extractText(pdfBuffer);
        break;
      }

      case 'url':
        extractedText = await webScraperService.scrapeUrl(sourceUrl);
        break;

      case 'youtube':
        extractedText =
          await youtubeTranscriptService.fetchTranscript(sourceUrl);
        break;

      case 'document':
        // For plain text documents
        const fs = await import('fs');
        extractedText = fs.readFileSync(sourceUrl, 'utf-8');
        break;

      default:
        throw new Error(`Unknown type: ${type}`);
    }

    // Update content with extracted text
    await contentService.updateContent(contentId, extractedText);
    await contentService.updateStatus(contentId, 'completed');

    logger.info(`✅ Content processed successfully: ${contentId}`);

    return { success: true, contentLength: extractedText.length };
  } catch (error: any) {
    logger.error(`❌ Content processing failed: ${contentId}`, error);

    await contentService.updateStatus(
      contentId,
      'failed',
      error.message || 'Unknown error'
    );

    throw error; // Re-throw for Bull retry mechanism
  }
});

logger.info('🔧 Content processor worker started');

export default contentQueue;
