import { asyncHandler } from '../utils/asyncHandler.util';
import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response.util';
import { contentService } from '../services/content.service';

export class ContentController {
  uploadPdf = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return ResponseUtil.error(res, 'No file uploaded', 400);
    }

    const { title } = req.body;
    const content = await contentService.createContent(
      req.user!._id.toString(),
      'pdf',
      req.file.path,
      title || req.file.originalname
    );

    ResponseUtil.success(res, { content }, 'PDF uploaded', 201);
  });

  processUrl = asyncHandler(async (req: Request, res: Response) => {
    const { title, url } = req.body;

    const content = await contentService.createContent(
      req.user!._id.toString(),
      'url',
      url,
      title
    );

    ResponseUtil.success(res, { content }, 'URL submitted', 201);
  });

  processYoutube = asyncHandler(async (req: Request, res: Response) => {
    const { url, title } = req.body;
    const content = await contentService.createContent(
      req.user!._id.toString(),
      'youtube',
      url,
      title
    );

    ResponseUtil.success(res, { content }, 'YouTube video submitted', 201);
  });

  getContent = asyncHandler(async (req: Request, res: Response) => {
    const content = await contentService.getContent(
      req.params.id,
      req.user!._id.toString()
    );
    ResponseUtil.success(res, content);
  });

  getUserContent = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const content = await contentService.getUserContent(
      req.user!.id.toString(),
      page,
      limit
    );

    ResponseUtil.success(res, content);
  });

  deleteContent = asyncHandler(async (req: Request, res: Response) => {
    await contentService.deleteContent(req.params.id, req.user!._id.toString());
    ResponseUtil.success(res, null, 'Content deleted');
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const content = await contentService.getContent(
      req.params.id,
      req.user!._id.toString()
    );
    ResponseUtil.success(res, {
      status: content.processingStatus,
      error: content.errorMessage,
    });
  });
}

export const contentController = new ContentController();
