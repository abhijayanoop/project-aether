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

// Save generated materials
router.post(
  '/:contentId/flashcards/save',
  studyMaterialController.saveFlashcards
);
router.post('/:contentId/quiz/save', studyMaterialController.saveQuiz);
router.post('/:contentId/summary/save', studyMaterialController.saveSummary);

// Get materials
router.get('/', studyMaterialController.getAllMaterials);
router.get('/folders', studyMaterialController.getFolders);
router.get('/tags', studyMaterialController.getTags);
router.get('/stats', studyMaterialController.getStats);
router.get('/:id', studyMaterialController.getMaterial);

// Update/Delete
router.put('/:id', studyMaterialController.updateMaterial);
router.delete('/:id', studyMaterialController.deleteMaterial);

// Quiz attempts
router.post('/:id/attempt', studyMaterialController.recordAttempt);

export default router;
