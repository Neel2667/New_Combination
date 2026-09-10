import { z } from 'zod';
import { AssetSchema } from './asset';

export const AssetUploadRequestSchema = z.object({
  source: z.string().describe('JSON stringified AssetSource'),
  license: z.string().describe('JSON stringified AssetLicense'),
  visual: z.string().optional().describe('JSON stringified AssetVisual'),
});

export const AssetListResponseSchema = z.object({
  items: z.array(AssetSchema),
  total: z.number().int().min(0),
});

export type AssetUploadRequest = z.infer<typeof AssetUploadRequestSchema>;
export type AssetListResponse = z.infer<typeof AssetListResponseSchema>;
