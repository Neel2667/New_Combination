import { Asset, AssetSource, AssetLicense, AssetMedia, AssetVisual } from '@combination/shared';
import { AssetService } from './asset.service';
import { AssetRepository } from '../repositories/asset.repository';
import { FileInspector } from './file-inspector';
import { HashCalculator } from './hash-calculator';
import { AssetStorage } from '../storage/asset-storage.interface';
import * as crypto from 'crypto';

export interface IngestionPayload {
  filePath: string;
  source: AssetSource;
  license: AssetLicense;
  visual?: AssetVisual;
}

export class AssetIngestionService {
  constructor(
    private readonly assetService: AssetService,
    private readonly assetRepository: AssetRepository,
    private readonly assetStorage: AssetStorage
  ) {}

  async ingest(payload: IngestionPayload): Promise<Asset> {
    const { filePath, source, license, visual = {} } = payload;

    // 1. Calculate Hash
    const sha256 = await HashCalculator.calculateSha256(filePath);

    // 2. Duplicate Detection
    const existing = await this.assetRepository.findBySha256(sha256);
    if (existing) {
      throw new Error(`Duplicate asset detected. An asset with this SHA-256 already exists (id: ${existing.id}).`);
    }

    // 3. Inspect File
    const inspection = await FileInspector.inspect(filePath);

    // 4. Construct Asset
    const media: AssetMedia = {
      sha256,
      width: inspection.width,
      height: inspection.height,
      durationMs: inspection.durationMs,
      hasAlpha: inspection.hasAlpha,
      aspectRatio: inspection.aspectRatio,
    };

    const assetId = crypto.randomUUID();
    const assetData: Partial<Asset> = {
      id: assetId,
      type: inspection.type,
      importedAt: new Date().toISOString(),
      source,
      license,
      media,
      visual,
    };

    // 5. Store Physical Bytes
    await this.assetStorage.store(assetId, filePath);

    // 6. Persistence & Rollback handling
    try {
      const createdAsset = await this.assetService.createAsset(assetData);
      return createdAsset;
    } catch (error) {
      // Rollback physical storage to prevent orphaned files
      await this.assetStorage.delete(assetId).catch(() => {});
      throw error;
    }
  }
}
