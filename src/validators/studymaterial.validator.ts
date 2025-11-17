import { z } from 'zod';

// Create study material
export const createStudyMaterialSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long')
    .trim(),
  sources: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid source ID'))
    .min(1, 'At least one source is required')
    .max(10, 'Maximum 10 sources allowed'),
  tags: z
    .array(z.string().trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
});

// Update study material
export const updateStudyMaterialSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  tags: z.array(z.string().trim()).max(10).optional(),
});

// Query parameters for listing
export const getStudyMaterialsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine((val) => val > 0, 'Page must be positive')
    .optional()
    .default('1'),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine((val) => val > 0 && val <= 100, 'Limit must be 1-100')
    .optional()
    .default('10'),
  search: z.string().trim().optional(),
});

// Study material ID
export const studyMaterialIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid study material ID'),
});

export type CreateStudyMaterialInput = z.infer<
  typeof createStudyMaterialSchema
>;
export type UpdateStudyMaterialInput = z.infer<
  typeof updateStudyMaterialSchema
>;
export type GetStudyMaterialsQuery = z.infer<
  typeof getStudyMaterialsQuerySchema
>;

export const generateFlashcardsSchema = z.object({
  count: z.number().min(1).max(20).optional().default(10),
});

export const generateQuizSchema = z.object({
  count: z.number().min(1).max(10).optional().default(5),
});

export const generateSummarySchema = z.object({
  type: z.enum(['short', 'detailed']).optional().default('short'),
});

export const contentIdSchema = z.object({
  contentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid content ID'),
});
