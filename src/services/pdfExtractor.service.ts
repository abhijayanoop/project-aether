import pdfParse from 'pdf-parse';

export class PDFExtractorService {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      // Handle both default and named exports
      const parsePDF = (pdfParse as any).default || pdfParse;
      const data = await parsePDF(buffer);
      return data.text;
    } catch (error: any) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractMetadata(buffer: Buffer): Promise<any> {
    try {
      const parsePDF = (pdfParse as any).default || pdfParse;
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

export default new PDFExtractorService();
