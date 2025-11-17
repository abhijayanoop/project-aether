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

router.post(
  '/pdf',
  // uploadLimiter,
  uploadConfig.single('file'),
  contentController.uploadPdf
);
router.post('/url', validate(urlContentSchema), contentController.processUrl);
router.post(
  '/youtube',
  validate(youtubeContentSchema),
  contentController.processYoutube
);
router.get('/', contentController.getUserContent);
router.get(
  '/:id',
  validate(contentIdSchema, 'params'),
  contentController.getContent
);
router.get(
  '/:id/status',
  validate(contentIdSchema, 'params'),
  contentController.getStatus
);
router.delete(
  '/:id',
  validate(contentIdSchema, 'params'),
  contentController.deleteContent
);

export default router;
