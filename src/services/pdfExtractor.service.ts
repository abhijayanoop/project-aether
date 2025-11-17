import fs from 'fs';
import logger from '../config/logger';

export class PdfExtractorService {
  async extractText(filePath: string): Promise<string> {
    try {
      // Dynamic import for CommonJS module
      const pdfParse = (await import('pdf-parse')).default;

      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);

      logger.info('Pdf text extracted successfully', {
        pages: data.numpages,
        length: data.text.length,
      });

      return data.text;
    } catch (error) {
      logger.error('Failed to extract text', error);
      throw new Error('Failed to extract PDF text');
    }
  }
}

export const pdfExtractorService = new PdfExtractorService();
