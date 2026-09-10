import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { AssetRepository } from '../repositories/asset.repository';
import { AssetService } from './asset.service';
import { AssetIngestionService } from './asset-ingestion.service';
import { LocalFilesystemStorage } from '../storage/local-filesystem-storage';
import * as schema from '../db/schema';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let db: ReturnType<typeof drizzle>;
let sqlite: Database.Database;
let repository: AssetRepository;
let assetService: AssetService;
let assetStorage: LocalFilesystemStorage;
let ingestionService: AssetIngestionService;
let storageRoot: string;

describe('AssetIngestionService (Integration)', () => {
  const testDir = path.join(__dirname, 'test-assets-integration');
  const pngFile = path.join(testDir, 'test.png');
  const pngFile2 = path.join(testDir, 'test2.png');

  beforeAll(() => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema });
    const migrationsFolder = path.join(__dirname, '../db/migrations');
    migrate(db, { migrationsFolder });
    repository = new AssetRepository(db as unknown as typeof import("../db").db);
    assetService = new AssetService(repository);
    
    storageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vce-integration-storage-'));
    assetStorage = new LocalFilesystemStorage(storageRoot);

    ingestionService = new AssetIngestionService(assetService, repository, assetStorage);

    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    fs.writeFileSync(pngFile, Buffer.from(pngBase64, 'base64'));
    const png2Base64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4YAQEH+5QAAAAASUVORK5CYII=";
    fs.writeFileSync(pngFile2, Buffer.from(png2Base64, 'base64'));
  });

  afterAll(() => {
    sqlite.close();
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.rmSync(storageRoot, { recursive: true, force: true });
  });

  it('successfully ingests a valid media file into the database and stores physically', async () => {
    const payload = {
      filePath: pngFile,
      source: { name: 'Test Source', url: 'https://test.com' },
      license: { name: 'CC0', url: 'https://test.com/license', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false },
    };
    const asset = await ingestionService.ingest(payload);
    
    expect(asset.id).toBeDefined();
    expect(asset.type).toBe('image');
    expect(asset.media.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(asset.media.width).toBe(1);
    expect(asset.media.height).toBe(1);

    const retrieved = await repository.getById(asset.id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.id).toBe(asset.id);

    const exists = await assetStorage.exists(asset.id);
    expect(exists).toBe(true);
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
    const payload = {
      filePath: pngFile2,
      source: { name: 'Test Source', url: 'https://test.com' },
      license: { name: 'Invalid', url: 'not-a-url', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false },
    };
    await expect(ingestionService.ingest(payload)).rejects.toThrow();
  });
});
