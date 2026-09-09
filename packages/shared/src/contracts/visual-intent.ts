import { z } from 'zod';

export const VisualIntentSchema = z.object({
  sceneId: z.string(),
  concept: z.string(),
  emotion: z.string().optional(),
  function: z.enum(['hook', 'explain', 'demonstrate', 'compare', 'emphasize', 'transition', 'payoff', 'cta']),
  energy: z.number().min(0).max(1),
  subjects: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  visualConstraints: z.array(z.string()).optional(),
  durationMs: z.number().int().min(1).optional(),
}).strict();

export type VisualIntent = z.infer<typeof VisualIntentSchema>;
