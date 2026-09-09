import { z } from 'zod';

export const MatchCandidateSchema = z.object({
  id: z.string(),
  score: z.number(),
  assets: z.array(z.string()),
  reasons: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export const MatchResultSchema = z.object({
  sceneId: z.string(),
  candidates: z.array(MatchCandidateSchema),
});

export type MatchCandidate = z.infer<typeof MatchCandidateSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
