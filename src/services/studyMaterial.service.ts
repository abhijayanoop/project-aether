import mongoose from 'mongoose';
import { NotFoundError } from '../middleware/error.middleware';
import { StudyMaterial } from '../models/StudyMaterial.model';

export class StudyMaterialService {
  async saveFlashcards(
    userId: string,
    contentId: string,
    title: string,
    flashcards: Array<{ question: string; answer: string }>,
    tags?: Array<string>,
    folder?: string
  ) {
    return await StudyMaterial.create({
      userId,
      contentId,
      type: 'flashcard',
      title,
      data: { flashcards },
      tags,
      folder,
    });
  }

  async saveQuiz(
    userId: string,
    contentId: string,
    title: string,
    questions: any[],
    tags: string[] = [],
    folder?: string
  ) {
    return await StudyMaterial.create({
      userId,
      contentId,
      type: 'quiz',
      title,
      data: { questions, attempts: [] },
      tags,
      folder,
    });
  }

  async saveSummary(
    userId: string,
    contentId: string,
    title: string,
    summary: string,
    summaryType: 'short' | 'detailed',
    keyConcepts: string[] = [],
    tags: string[] = [],
    folder?: string
  ) {
    return await StudyMaterial.create({
      userId,
      contentId,
      type: 'summary',
      title,
      data: { summary, summaryType, keyConcepts },
      tags,
      folder,
    });
  }

  async saveConcepts(
    userId: string,
    contentId: string,
    title: string,
    concepts: string[],
    tags: string[] = [],
    folder?: string
  ) {
    return await StudyMaterial.create({
      userId,
      contentId,
      type: 'concepts',
      title,
      data: { keyConcepts: concepts },
      tags,
      folder,
    });
  }

  async getUserMaterials(
    userId: string,
    filters: {
      type?: string;
      tags?: string[];
      filter?: string;
      search?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ) {
    const query: any = { userId };

    if (filters.type) query.type = filters.type;
    if (filters.filter) query.filter = filters.filter;
    if (filters.tags?.length) query.tags = { $in: filters.tags };
    if (filters.search) query.$text = { $search: filters.search };

    const skip = (page - 1) * limit;

    const [materials, total] = await Promise.all([
      StudyMaterial.find(query)
        .populate('contentId', 'title type sourceUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudyMaterial.countDocuments(query),
    ]);

    return {
      materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getMaterialById(materialId: string, userId: string) {
    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId,
    }).populate('contentId', 'title type sourceUrl');

    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  async updateMaterials(materialId: string, userId: string, updates: any) {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: materialId, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  async deleteMaterial(materialId: string, userId: string) {
    const material = await StudyMaterial.findOneAndDelete({
      _id: materialId,
      userId,
    });

    if (!material) throw new NotFoundError('Study material not found');
    return material;
  }

  async getUserFolders(userId: string) {
    return await StudyMaterial.distinct('folder', {
      userId,
      folder: { $exists: true, $ne: null },
    });
  }

  async getUserTags(userId: string) {
    return await StudyMaterial.distinct('tags', { userId });
  }

  async getUserStats(userId: string) {
    const stats = await StudyMaterial.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: 'type', count: { $sum: 1 } } },
    ]);

    const total = await StudyMaterial.countDocuments({ userId });

    return {
      total,
      byType: stats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
    };
  }

  async recordQuizAttempt(
    materialId: string,
    userId: string,
    score: number,
    totalQuestions: number
  ) {
    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId,
      type: 'quiz',
    });

    if (!material) throw new NotFoundError('Material not found');

    if (!material.data.attempts) material.data.attempts = [];

    material.data.attempts.push({
      score,
      totalQuestions,
      completedAt: new Date(),
    });

    await material.save();
    return material;
  }
}

export const studyMaterialService = new StudyMaterialService();
