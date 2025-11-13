import { z } from 'zod';

export const urlContentSchema = z.object({
  url: z.string().url('Invalid URL'),
  title: z.string().min(1, 'Title is required'),
});

export const youtubeContentSchema = z.object({
  url: z
    .string()
    .url('Invalid URL')
    .refine(
      (url) => url.includes('youtube.com') || url.includes('youtu.be'),
      'Must be a valid YouTube URL'
    ),
  title: z.string().min(1, 'Title is required'),
});

export const contentIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid content ID'),
});

export type UrlContentInput = z.infer<typeof urlContentSchema>;
export type YoutubeContentInput = z.infer<typeof youtubeContentSchema>;
export type ContentIdInput = z.infer<typeof contentIdSchema>;
