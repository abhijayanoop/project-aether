import pdfParse from 'pdf-parse';

export class PDFExtractorService {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const parsePDF =
        typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default;

      if (typeof parsePDF !== 'function') {
        throw new Error('pdf-parse module not loaded correctly');
      }

      const data = await parsePDF(buffer);
      return data.text;
    } catch (error: any) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractMetadata(buffer: Buffer): Promise<any> {
    try {
      const parsePDF =
        typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default;

      if (typeof parsePDF !== 'function') {
        throw new Error('pdf-parse module not loaded correctly');
      }

      const data = await parsePDF(buffer);
      return {
        title: data.info?.Title || 'Untitled',
        author: data.info?.Author || 'Unknown',
        pages: data.numpages,
        text: data.text,
      };
    } catch (error: any) {
      throw new Error(`Failed to extract metadata from PDF: ${error.message}`);
    }
  }
}

export const pdfExtractorService = new PDFExtractorService();
