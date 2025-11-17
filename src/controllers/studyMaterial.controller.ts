import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.util';
import { contentService } from '../services/content.service';
import { NotFoundError } from '../middleware/error.middleware';
import { aiService } from '../services/aiService.service';
import { ResponseUtil } from '../utils/response.util';

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
}

export const studyMaterialController = new StudyMaterialController();
