import { db as defaultDb } from '../db';
import { assets } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { Asset } from '@combination/shared';

export class AssetRepository {
  constructor(private readonly dbInstance: typeof defaultDb = defaultDb) {}

  async create(asset: Asset): Promise<void> {
    await this.dbInstance.insert(assets).values({
      id: asset.id,
      type: asset.type,
      importedAt: asset.importedAt,
      sha256: asset.media.sha256,
      licenseStatus: asset.license.status,
      commercialUse: asset.license.commercialUse,
      modificationAllowed: asset.license.modificationAllowed,
      attributionRequired: asset.license.attributionRequired,
      source: JSON.stringify(asset.source),
      license: JSON.stringify(asset.license),
      media: JSON.stringify(asset.media),
      visual: JSON.stringify(asset.visual),
    });
  }

  async getById(id: string): Promise<Asset | null> {
    const row = await this.dbInstance.select().from(assets).where(eq(assets.id, id)).get();
    if (!row) return null;
    return this.mapRowToAsset(row);
  }

  async update(id: string, asset: Asset): Promise<void> {
    await this.dbInstance.update(assets).set({
      type: asset.type,
      importedAt: asset.importedAt,
      sha256: asset.media.sha256,
      licenseStatus: asset.license.status,
      commercialUse: asset.license.commercialUse,
      modificationAllowed: asset.license.modificationAllowed,
      attributionRequired: asset.license.attributionRequired,
      source: JSON.stringify(asset.source),
      license: JSON.stringify(asset.license),
      media: JSON.stringify(asset.media),
      visual: JSON.stringify(asset.visual),
    }).where(eq(assets.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.dbInstance.delete(assets).where(eq(assets.id, id));
  }

  async list(): Promise<Asset[]> {
    const rows = await this.dbInstance.select().from(assets).all();
    return rows.map(row => this.mapRowToAsset(row));
  }

  async listProductionEligible(): Promise<Asset[]> {
    const rows = await this.dbInstance.select().from(assets).where(
      and(
        eq(assets.licenseStatus, 'approved'),
        eq(assets.commercialUse, true)
      )
    ).all();
    return rows.map(row => this.mapRowToAsset(row));
  }

  private mapRowToAsset(row: Record<string, unknown>): Asset {
    return {
      id: row.id as string,
      type: row.type as Asset['type'],
      importedAt: row.importedAt as string,
      source: JSON.parse(row.source as string),
      license: JSON.parse(row.license as string),
      media: JSON.parse(row.media as string),
      visual: JSON.parse(row.visual as string),
    };
  }
}
