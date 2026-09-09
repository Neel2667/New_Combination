import { Asset, AssetSchema } from '@combination/shared';
import { AssetRepository } from '../repositories/asset.repository';
import { validateContract } from '@combination/shared';

export class AssetService {
  constructor(private readonly repository: AssetRepository) {}

  async createAsset(data: unknown): Promise<Asset> {
    const asset = validateContract(AssetSchema, data);
    
    // Additional provenance domain rule checks could go here
    // though the Zod schema already enforces required fields.

    await this.repository.create(asset);
    return asset;
  }

  async getAssetForProduction(id: string): Promise<Asset> {
    const asset = await this.repository.getById(id);
    if (!asset) {
      throw new Error(`Asset not found: ${id}`);
    }

    if (asset.license.status === 'review') {
      throw new Error(`Asset ${id} cannot enter production: license is in review.`);
    }

    if (asset.license.status === 'blocked') {
      throw new Error(`Asset ${id} cannot enter production: license is blocked.`);
    }

    if (!asset.license.commercialUse) {
      throw new Error(`Asset ${id} cannot enter production: commercial use is not allowed.`);
    }

    return asset;
  }
}
