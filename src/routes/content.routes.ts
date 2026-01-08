import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';
import { uploadConfig } from '../middleware/fileupload.middleware';
import { contentController } from '../controllers/content.controller';
import { validate } from '../middleware/validator.middleware';
import {
  contentIdSchema,
  urlContentSchema,
  youtubeContentSchema,
} from '../validators/content.validator';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/content/pdf:
 *   post:
 *     summary: Upload a PDF for processing
 *     tags:
 *       - Content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: PDF uploaded and processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/pdf',
  // uploadLimiter,
  uploadConfig.single('file'),
  contentController.uploadPdf
);

/**
 * @openapi
 * /api/content/url:
 *   post:
 *     summary: Process content from a URL
 *     tags:
 *       - Content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: URL content processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/url', validate(urlContentSchema), contentController.processUrl);

/**
 * @openapi
 * /api/content/youtube:
 *   post:
 *     summary: Process content from a YouTube video
 *     tags:
 *       - Content
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: YouTube video URL
 *     responses:
 *       201:
 *         description: YouTube content processing started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/youtube',
  validate(youtubeContentSchema),
  contentController.processYoutube
);

/**
 * @openapi
 * /api/content:
 *   get:
 *     summary: Get all content for the authenticated user
 *     tags:
 *       - Content
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user content
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', contentController.getUserContent);

/**
 * @openapi
 * /api/content/{id}:
 *   get:
 *     summary: Get a specific content item
 *     tags:
 *       - Content
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
 *         description: Content details
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.get(
  '/:id',
  validate(contentIdSchema, 'params'),
  contentController.getContent
);

/**
 * @openapi
 * /api/content/{id}/status:
 *   get:
 *     summary: Get processing status of a content item
 *     tags:
 *       - Content
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
 *         description: Content status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.get(
  '/:id/status',
  validate(contentIdSchema, 'params'),
  contentController.getStatus
);

/**
 * @openapi
 * /api/content/{id}:
 *   delete:
 *     summary: Delete a content item
 *     tags:
 *       - Content
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
 *         description: Content deleted
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */
router.delete(
  '/:id',
  validate(contentIdSchema, 'params'),
  contentController.deleteContent
);

export default router;
