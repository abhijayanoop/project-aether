import logger from '../config/logger';
import fs from 'fs';

const pdfParse = require('pdf-parse');

export class PdfExtractorService {
  async extractText(filePath: string): Promise<string> {
    try {
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
