import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export class PDFExtractorService {
  async extractText(buffer: Buffer): Promise<string> {
    try {
      if (!Buffer.isBuffer(buffer)) {
        throw new Error(
          `PDFExtractor expected Buffer but received ${typeof buffer}`
        );
      }

      if (buffer.length === 0) {
        throw new Error('Empty or invalid PDF buffer');
      }

      const header = buffer.toString('utf8', 0, 5);
      if (!header.startsWith('%PDF')) {
        throw new Error('Invalid PDF format - missing PDF header');
      }

      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        verbosity: 0, // Suppress warnings
        useSystemFonts: true,
        standardFontDataUrl: undefined, // Don't load external fonts
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      const text = fullText.trim();

      if (!text || text.length === 0) {
        throw new Error(
          'PDF contains no extractable text (might be scanned/image-based)'
        );
      }

      return text;
    } catch (error: any) {
      // Better error messages
      if (error.message?.includes('Invalid PDF structure')) {
        throw new Error('PDF is corrupted or uses unsupported features');
      }
      if (
        error.message?.includes('password') ||
        error.message?.includes('encrypted')
      ) {
        throw new Error('PDF is password protected');
      }
      if (error.message?.includes('XRef')) {
        throw new Error('PDF has corrupted cross-reference table');
      }
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractMetadata(buffer: Buffer): Promise<{
    title: string;
    author: string;
    pages: number;
    text: string;
  }> {
    try {
      if (!buffer || buffer.length === 0) {
        throw new Error('Empty or invalid PDF buffer');
      }

      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        verbosity: 0,
        useSystemFonts: true,
        standardFontDataUrl: undefined,
      });

      const pdf = await loadingTask.promise;

      // Try to extract metadata
      let metadata: any = null;
      try {
        const metadataResult = await pdf.getMetadata();
        metadata = metadataResult;
      } catch (e) {
        console.warn('Could not extract PDF metadata:', e);
      }

      // Extract text
      const text = await this.extractText(buffer);

      return {
        title: metadata?.info?.Title || 'Untitled',
        author: metadata?.info?.Author || 'Unknown',
        pages: pdf.numPages,
        text: text,
      };
    } catch (error: any) {
      if (error.message?.includes('Invalid PDF structure')) {
        throw new Error('PDF is corrupted or uses unsupported features');
      }
      if (
        error.message?.includes('password') ||
        error.message?.includes('encrypted')
      ) {
        throw new Error('PDF is password protected');
      }
      throw new Error(`Failed to extract metadata from PDF: ${error.message}`);
    }
  }
}

export const pdfExtractorService = new PDFExtractorService();
