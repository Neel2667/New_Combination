import { Asset, AssetSchema } from '@combination/shared';
import { AssetRepository } from '../repositories/asset.repository';
import { validateContract } from '@combination/shared';

export class AssetService {
  constructor(private readonly repository: AssetRepository) {}

  async createAsset(data: unknown): Promise<Asset> {
    const asset = validateContract(AssetSchema, data);
    await this.repository.create(asset);
    return asset;
  }

  async getAssetForProduction(id: string): Promise<Asset> {
    const asset = await this.repository.getById(id);
    if (!asset) {
      throw new Error(`Asset not found: ${id}`);
    }
    
    this.assertProductionEligibility(asset);
    return asset;
  }

  async listProductionEligible(): Promise<Asset[]> {
    const candidates = await this.repository.listProductionEligible();
    // The service remains the authority for final domain validation.
    // It filters the candidates to ensure they pass domain rules.
    return candidates.filter(asset => {
      try {
        this.assertProductionEligibility(asset);
        return true;
      } catch {
        return false;
      }
    });
  }

  private assertProductionEligibility(asset: Asset): void {
    if (asset.license.status === 'review') {
      throw new Error(`Asset ${asset.id} cannot enter production: license is in review.`);
    }
    if (asset.license.status === 'blocked') {
      throw new Error(`Asset ${asset.id} cannot enter production: license is blocked.`);
    }
    if (!asset.license.commercialUse) {
      throw new Error(`Asset ${asset.id} cannot enter production: commercial use is not allowed.`);
    }
    if (asset.license.status !== 'approved') {
      throw new Error(`Asset ${asset.id} cannot enter production: license status must be approved.`);
    }
  }
}
