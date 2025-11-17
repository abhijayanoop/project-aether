import { Router } from 'express';
import { studyMaterialController } from '../controllers/studyMaterial.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { aiLimiter } from '../middleware/rateLimiter.middleware';
import {
  generateFlashcardsSchema,
  generateQuizSchema,
  generateSummarySchema,
  contentIdSchema,
} from '../validators/studymaterial.validator';

const router = Router();

router.use(authenticate);
// router.use(aiLimiter);

// Generate flashcards
router.post(
  '/:contentId/flashcards',
  validate(contentIdSchema, 'params'),
  validate(generateFlashcardsSchema, 'body'),
  studyMaterialController.generateFlashcards
);

// Generate quiz
router.post(
  '/:contentId/quiz',
  validate(contentIdSchema, 'params'),
  validate(generateQuizSchema, 'body'),
  studyMaterialController.generateQuiz
);

// Generate summary
router.post(
  '/:contentId/summary',
  validate(contentIdSchema, 'params'),
  validate(generateSummarySchema, 'body'),
  studyMaterialController.generateSummary
);

// Extract key concepts
router.post(
  '/:contentId/concepts',
  validate(contentIdSchema, 'params'),
  studyMaterialController.extractKeyConcepts
);

export default router;
