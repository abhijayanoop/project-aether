import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.util';
import { contentService } from '../services/content.service';
import { NotFoundError } from '../middleware/error.middleware';
import { aiService } from '../services/aiService.service';
import { ResponseUtil } from '../utils/response.util';
import { studyMaterialService } from '../services/studyMaterial.service';

export class StudyMaterialController {
  generateFlashcards = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { count = 10 } = req.body;

    const content = await contentService.getContent(
      contentId,
      req.user!._id.toString()
    );

    if (content.processingStatus !== 'completed') {
      throw new NotFoundError('Content is still being processed');
    }

    const flashcards = await aiService.generateFlashcards(
      content.content,
      count
    );

    ResponseUtil.success(
      res,
      { flashcards },
      'Flashcards generated successfully'
    );
  });

  generateQuiz = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { count = 5 } = req.body;

    const content = await contentService.getContent(
      contentId,
      req.user!._id.toString()
    );

    if (content.processingStatus !== 'completed') {
      throw new NotFoundError('Content is still being processed');
    }

    const quiz = await aiService.generateQuiz(content.content, count);

    ResponseUtil.success(res, { quiz }, 'Quiz generated successfully');
  });

  generateSummary = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { type = 'short' } = req.body;

    const content = await contentService.getContent(
      contentId,
      req.user!._id.toString()
    );

    if (content.processingStatus !== 'completed') {
      throw new NotFoundError('Content processing not completed');
    }

    const summary = await aiService.generateSummary(content.content, type);

    ResponseUtil.success(res, { summary }, 'Summary generated successfully');
  });

  extractKeyConcepts = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;

    const content = await contentService.getContent(
      contentId,
      req.user!._id.toString()
    );

    if (content.processingStatus !== 'completed') {
      throw new NotFoundError('Content processing not completed');
    }

    const concepts = await aiService.extractKeyConcepts(content.content);

    ResponseUtil.success(
      res,
      { concepts },
      'Key concepts extracted successfully'
    );
  });

  saveFlashcards = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { title, flashcards, tags, folder } = req.body;

    const material = await studyMaterialService.saveFlashcards(
      req.user!._id.toString(),
      contentId,
      title,
      flashcards,
      tags,
      folder
    );

    ResponseUtil.success(res, { material }, 'Flashcards saved', 201);
  });

  saveQuiz = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { title, questions, tags, folder } = req.body;

    const material = await studyMaterialService.saveQuiz(
      req.user!._id.toString(),
      contentId,
      title,
      questions,
      tags,
      folder
    );

    ResponseUtil.success(res, { material }, 'Quiz saved', 201);
  });

  saveSummary = asyncHandler(async (req: Request, res: Response) => {
    const { contentId } = req.params;
    const { title, summary, summaryType, keyConcepts, tags, folder } = req.body;

    const material = await studyMaterialService.saveSummary(
      req.user!._id.toString(),
      contentId,
      title,
      summary,
      summaryType,
      keyConcepts,
      tags,
      folder
    );

    ResponseUtil.success(res, { material }, 'Summary saved', 201);
  });

  getAllMaterials = asyncHandler(async (req: Request, res: Response) => {
    const { type, folder, tags, search, page = '1', limit = '20' } = req.query;

    const filters = {
      type: type as string,
      folder: folder as string,
      tags: tags ? (tags as string).split(',') : undefined,
      search: search as string,
    };

    const result = await studyMaterialService.getUserMaterials(
      req.user!._id.toString(),
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    ResponseUtil.success(res, result);
  });

  getMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const material = await studyMaterialService.getMaterialById(
      id,
      req.user!._id.toString()
    );
    ResponseUtil.success(res, material);
  });

  updateMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const material = await studyMaterialService.updateMaterials(
      id,
      req.user!._id.toString(),
      req.body
    );
    ResponseUtil.success(res, material, 'Material updated');
  });

  deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await studyMaterialService.deleteMaterial(id, req.user!._id.toString());
    ResponseUtil.success(res, null, 'Material deleted');
  });

  getFolders = asyncHandler(async (req: Request, res: Response) => {
    const folders = await studyMaterialService.getUserFolders(
      req.user!._id.toString()
    );
    ResponseUtil.success(res, { folders });
  });

  getTags = asyncHandler(async (req: Request, res: Response) => {
    const tags = await studyMaterialService.getUserTags(
      req.user!._id.toString()
    );
    ResponseUtil.success(res, { tags });
  });

  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await studyMaterialService.getUserStats(
      req.user!._id.toString()
    );
    ResponseUtil.success(res, stats);
  });

  recordAttempt = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { score, totalQuestions } = req.body;

    const material = await studyMaterialService.recordQuizAttempt(
      id,
      req.user!._id.toString(),
      score,
      totalQuestions
    );

    ResponseUtil.success(res, material, 'Quiz attempt recorded');
  });
}

export const studyMaterialController = new StudyMaterialController();
