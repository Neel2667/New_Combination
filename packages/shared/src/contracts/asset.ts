import { z } from 'zod';

export const AssetSourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  author: z.string().optional(),
});

export const AssetLicenseSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  status: z.enum(['approved', 'review', 'blocked']),
  commercialUse: z.boolean().optional(),
  modificationAllowed: z.boolean().optional(),
  attributionRequired: z.boolean().optional(),
});

export const AssetMediaSchema = z.object({
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
  durationMs: z.number().int().min(0).optional(),
  hasAlpha: z.boolean().optional(),
  sha256: z.string().optional(),
});

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
});

export const AssetSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['video', 'image', 'svg', 'icon', 'illustration', 'audio', 'component', 'texture', 'effect']),
  source: AssetSourceSchema,
  license: AssetLicenseSchema,
  media: AssetMediaSchema,
  visual: AssetVisualSchema,
});

export type AssetSource = z.infer<typeof AssetSourceSchema>;
export type AssetLicense = z.infer<typeof AssetLicenseSchema>;
export type AssetMedia = z.infer<typeof AssetMediaSchema>;
export type AssetVisual = z.infer<typeof AssetVisualSchema>;
export type Asset = z.infer<typeof AssetSchema>;
