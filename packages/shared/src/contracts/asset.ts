import { z } from 'zod';

export const AssetSourceSchema = z.object({
  name: z.string(),
  url: z.string().url().or(z.literal('')),
  author: z.string().optional(),
}).strict();

export const AssetLicenseSchema = z.object({
  name: z.string(),
  url: z.string().url().or(z.literal('')),
  status: z.enum(['approved', 'review', 'blocked']),
  commercialUse: z.boolean(),
  modificationAllowed: z.boolean(),
  attributionRequired: z.boolean(),
}).strict();

export const AssetMediaSchema = z.object({
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  durationMs: z.number().int().min(0).optional(),
  hasAlpha: z.boolean().optional(),
  aspectRatio: z.number().positive().optional(),
  sha256: z.string().regex(/^[a-fA-F0-9]{64}$/, "Must be a valid SHA-256 hash"),
  mimeType: z.string().optional(),
}).strict();

export const AssetVisualSchema = z.object({
  subjects: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  style: z.string().optional(),
  mood: z.string().optional(),
  energy: z.number().min(0).max(1).optional(),
  complexity: z.number().min(0).max(1).optional(),
  direction: z.enum(['left', 'right', 'up', 'down', 'center', 'none']).optional(),
  focalArea: z.string().optional(),
  negativeSpace: z.string().optional(),
  textSafeArea: z.string().optional(),
  colors: z.object({
    dominant: z.array(z.string()).optional(),
    secondary: z.array(z.string()).optional(),
  }).strict().optional(),
  motion: z.enum(['static', 'pan', 'zoom', 'loop', 'erratic']).optional(),
  suggestedFunctions: z.array(z.enum(['hook', 'explain', 'demonstrate', 'compare', 'emphasize', 'transition', 'payoff', 'cta'])).optional(),
  compatibility: z.record(z.string(), z.boolean()).optional(),
}).strict();

export const AssetSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['video', 'image', 'svg', 'icon', 'illustration', 'audio', 'component', 'texture', 'effect']),
  importedAt: z.string().datetime(),
  source: AssetSourceSchema,
  license: AssetLicenseSchema,
  media: AssetMediaSchema,
  visual: AssetVisualSchema,
}).strict();

export type AssetSource = z.infer<typeof AssetSourceSchema>;export type AssetLicense = z.infer<typeof AssetLicenseSchema>;export type AssetMedia = z.infer<typeof AssetMediaSchema>;export type AssetVisual = z.infer<typeof AssetVisualSchema>;export type Asset = z.infer<typeof AssetSchema>;
