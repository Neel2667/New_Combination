import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { AssetRepository } from '../repositories/asset.repository';
import { AssetService } from './asset.service';
import { AssetIngestionService } from './asset-ingestion.service';
import * as schema from '../db/schema';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

let db: ReturnType<typeof drizzle>;
let sqlite: Database.Database;
let repository: AssetRepository;
let assetService: AssetService;
let ingestionService: AssetIngestionService;

describe('AssetIngestionService (Integration)', () => {
  const testDir = path.join(__dirname, 'test-assets-integration');
  const pngFile = path.join(testDir, 'test.png');

  beforeAll(() => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema });
    const migrationsFolder = path.join(__dirname, '../db/migrations');
    migrate(db, { migrationsFolder });

    repository = new AssetRepository(db as unknown as typeof import("../db").db);
    assetService = new AssetService(repository);
    ingestionService = new AssetIngestionService(assetService, repository);

    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    execSync(`convert -size 100x200 xc:transparent ${pngFile}`);
  });

  afterAll(() => {
    sqlite.close();
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('successfully ingests a valid media file into the database', async () => {
    const payload = {
      filePath: pngFile,
      source: { name: 'Test Source', url: 'https://test.com' },
      license: { name: 'CC0', url: 'https://test.com/license', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false },
    };

    const asset = await ingestionService.ingest(payload);
    
    expect(asset.id).toBeDefined();
    expect(asset.type).toBe('image');
    expect(asset.media.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(asset.media.width).toBe(100);
    expect(asset.media.height).toBe(200);

    const retrieved = await repository.getById(asset.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(asset.id);
  });

  it('rejects duplicate file with identical hash', async () => {
    const payload = {
      filePath: pngFile,
      source: { name: 'Test Source 2', url: 'https://test2.com' },
      license: { name: 'CC0', url: 'https://test.com/license', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false },
    };

    await expect(ingestionService.ingest(payload)).rejects.toThrow(/Duplicate asset/);
  });

  it('rejects invalid license data due to contract validation', async () => {
    // We create a new file so it has a different hash
    const pngFile2 = path.join(testDir, 'test2.png');
    execSync(`convert -size 50x50 xc:white ${pngFile2}`);
    
    const payload = {
      filePath: pngFile2,
      source: { name: 'Test Source', url: 'https://test.com' },
      license: { name: 'Invalid', url: 'not-a-url', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false }, // URL is invalid
    };

    await expect(ingestionService.ingest(payload)).rejects.toThrow(); // Zod error
  });
});
