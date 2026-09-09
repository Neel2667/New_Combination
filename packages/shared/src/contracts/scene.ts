import { z } from 'zod';

export const SceneLayerSchema = z.object({
  id: z.string(),
  role: z.enum(['background', 'subject', 'graphic', 'text', 'overlay', 'effect']),
  assetId: z.string().optional(),
  zIndex: z.number().int().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  scale: z.number().gt(0).optional(),
  opacity: z.number().min(0).max(1).optional(),
}).strict();

export const SceneSchema = z.object({
  id: z.string(),
  startMs: z.number().int().min(0),
  durationMs: z.number().int().min(1),
  layers: z.array(SceneLayerSchema),
}).strict();

export type SceneLayer = z.infer<typeof SceneLayerSchema>;
export type Scene = z.infer<typeof SceneSchema>;
