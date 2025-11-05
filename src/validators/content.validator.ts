import { z } from 'zod';

// URL content schema
export const urlContentSchema = z.object({
  url: z
    .string()
    .url('Invalid URL format')
    .regex(/^https?:\/\//, 'URL must start with http:// or https://'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim(),
  type: z.literal('url'),
});

// YouTube content schema
export const youtubeContentSchema = z.object({
  url: z
    .string()
    .url('Invalid URL')
    .regex(/youtube\.com|youtu\.be/, 'Must be a YouTube URL'),
  title: z.string().min(1).max(200).trim(),
  type: z.literal('youtube'),
});

// Content ID schema
export const contentIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid content ID'),
});

export type UrlContentInput = z.infer<typeof urlContentSchema>;
export type YoutubeContentInput = z.infer<typeof youtubeContentSchema>;
export type ContentIdInput = z.infer<typeof contentIdSchema>;
