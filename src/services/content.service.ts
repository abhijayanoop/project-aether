import contentQueue from '../config/queue';
import { NotFoundError } from '../middleware/error.middleware';
import { Content } from '../models/Content.model';

export class ContentService {
  async createContent(
    userId: string,
    type: 'url' | 'pdf' | 'document' | 'youtube',
    sourceUrl: string,
    title: string,
    metadata?: any
  ) {
    const content = await Content.create({
      userId,
      type,
      sourceUrl,
      title,
      metadata: metadata || {},
      processingStatus: 'pending',
    });

    await contentQueue.add('process-content', {
      contentId: content._id.toString(),
      type,
      sourceUrl,
    });

    return content;
  }

  async getContent(contentId: string, userId: string) {
    const content = await Content.findOne({ _id: contentId, userId });
    if (!content) throw new NotFoundError('No content found');
    return content;
  }

  async getUserContent(userId: string, page: number = 1, limit: number = 10) {
    const skipItems = (page - 1) * limit;
    const [contents, total] = await Promise.all([
      Content.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skipItems)
        .limit(limit),
      Content.countDocuments({ userId }),
    ]);
    return {
      contents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteContent(contentId: string, userId: string) {
    const content = await Content.findOneAndDelete({ _id: contentId, userId });
    if (!content) throw new NotFoundError('Content not found');
    return content;
  }

  async updateStatus(
    contentId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    errorMessage?: string
  ) {
    return await Content.findByIdAndUpdate(
      contentId,
      { processingStatus: status, ...(errorMessage && { errorMessage }) },
      { new: true }
    );
  }

  async updateContent(contentId: string, content: string) {
    return await Content.findByIdAndUpdate(
      contentId,
      { content },
      { new: true }
    );
  }
}

export const contentService = new ContentService();
