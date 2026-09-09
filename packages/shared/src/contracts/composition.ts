import { z } from 'zod';
import { SceneSchema } from './scene';

export const CompositionFormatSchema = z.object({
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  fps: z.number().gt(0),
}).strict();

export const CompositionAudioSchema = z.object({
  id: z.string(),
  type: z.enum(['narration', 'music', 'sfx']),
  assetId: z.string().optional(),
  startMs: z.number().int().min(0),
  durationMs: z.number().int().min(1).optional(),
  gain: z.number().optional(),
}).strict();

export const CompositionSchema = z.object({
  id: z.string(),
  version: z.number().int().min(1),
  format: CompositionFormatSchema,
  scenes: z.array(SceneSchema),
  audio: z.array(CompositionAudioSchema).optional(),
}).strict();

export type CompositionFormat = z.infer<typeof CompositionFormatSchema>;
export type CompositionAudio = z.infer<typeof CompositionAudioSchema>;
export type Composition = z.infer<typeof CompositionSchema>;
