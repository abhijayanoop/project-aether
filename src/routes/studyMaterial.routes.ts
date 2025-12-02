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

/**
 * @openapi
 * /api/study-material/{contentId}/flashcards:
 *   post:
 *     summary: Generate flashcards for a content item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content to generate flashcards from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Flashcard generation options
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Flashcards generated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:contentId/flashcards',
  validate(contentIdSchema, 'params'),
  validate(generateFlashcardsSchema, 'body'),
  studyMaterialController.generateFlashcards
);

/**
 * @openapi
 * /api/study-material/{contentId}/quiz:
 *   post:
 *     summary: Generate quiz questions for a content item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content to generate quiz from
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Quiz generation options
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Quiz generated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:contentId/quiz',
  validate(contentIdSchema, 'params'),
  validate(generateQuizSchema, 'body'),
  studyMaterialController.generateQuiz
);

/**
 * @openapi
 * /api/study-material/{contentId}/summary:
 *   post:
 *     summary: Generate a summary for a content item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content to summarize
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Summary generation options
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Summary generated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:contentId/summary',
  validate(contentIdSchema, 'params'),
  validate(generateSummarySchema, 'body'),
  studyMaterialController.generateSummary
);

/**
 * @openapi
 * /api/study-material/{contentId}/concepts:
 *   post:
 *     summary: Extract key concepts from a content item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Key concepts extracted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:contentId/concepts',
  validate(contentIdSchema, 'params'),
  studyMaterialController.extractKeyConcepts
);

/**
 * @openapi
 * /api/study-material/{contentId}/flashcards/save:
 *   post:
 *     summary: Save generated flashcards
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Flashcards payload to save
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Flashcards saved
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:contentId/flashcards/save',
  studyMaterialController.saveFlashcards
);

/**
 * @openapi
 * /api/study-material/{contentId}/quiz/save:
 *   post:
 *     summary: Save generated quiz
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Quiz payload to save
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Quiz saved
 *       401:
 *         description: Unauthorized
 */
router.post('/:contentId/quiz/save', studyMaterialController.saveQuiz);

/**
 * @openapi
 * /api/study-material/{contentId}/summary/save:
 *   post:
 *     summary: Save generated summary
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Summary payload to save
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Summary saved
 *       401:
 *         description: Unauthorized
 */
router.post('/:contentId/summary/save', studyMaterialController.saveSummary);

/**
 * @openapi
 * /api/study-material:
 *   get:
 *     summary: Get all study materials for the authenticated user
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of study materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *       401:
 *         description: Unauthorized
 */
router.get('/', studyMaterialController.getAllMaterials);

/**
 * @openapi
 * /api/study-material/folders:
 *   get:
 *     summary: Get study material folders
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of folders
 *       401:
 *         description: Unauthorized
 */
router.get('/folders', studyMaterialController.getFolders);

/**
 * @openapi
 * /api/study-material/tags:
 *   get:
 *     summary: Get tags used in study materials
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tags
 *       401:
 *         description: Unauthorized
 */
router.get('/tags', studyMaterialController.getTags);

/**
 * @openapi
 * /api/study-material/stats:
 *   get:
 *     summary: Get statistics for study materials
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Study material statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', studyMaterialController.getStats);

/**
 * @openapi
 * /api/study-material/{id}:
 *   get:
 *     summary: Get a single study material item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Study material details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', studyMaterialController.getMaterial);

/**
 * @openapi
 * /api/study-material/{id}:
 *   put:
 *     summary: Update a study material item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Study material updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:id', studyMaterialController.updateMaterial);

/**
 * @openapi
 * /api/study-material/{id}:
 *   delete:
 *     summary: Delete a study material item
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Study material deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:id', studyMaterialController.deleteMaterial);

/**
 * @openapi
 * /api/study-material/{id}/attempt:
 *   post:
 *     summary: Record a quiz attempt
 *     tags:
 *       - Study Material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the quiz / study material
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Attempt details (score, answers, etc.)
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Attempt recorded
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/attempt', studyMaterialController.recordAttempt);

export default router;
