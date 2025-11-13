import { YoutubeTranscript } from 'youtube-transcript';
import logger from '../config/logger';

export class YoutubeTranscriptService {
  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async fetchTranscript(url: string): Promise<string> {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) throw new Error('Invalid YouTube URL');

      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      const fullText = transcript.map((t) => t.text).join(' ');

      logger.info('YouTube transcript fetched', {
        videoId,
        length: fullText.length,
      });
      return fullText;
    } catch (error) {
      logger.error('YouTube transcript failed:', error);
      throw new Error('Failed to fetch YouTube transcript');
    }
  }
}

export const youtubeTranscriptService = new YoutubeTranscriptService();
