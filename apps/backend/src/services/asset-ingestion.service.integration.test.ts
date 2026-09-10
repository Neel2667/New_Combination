import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
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
  const pngFile3 = path.join(testDir, 'test3.png');

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
    const png3Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWcU04AAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4YAQEH+5QAAAAASUVORK5CYII=';
    fs.writeFileSync(pngFile3, Buffer.from(png3Base64, 'base64'));
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

  it('F. DB failure removes stored physical file', async () => {
    // Mock createAsset to throw an error
    const spy = vi.spyOn(assetService, 'createAsset').mockRejectedValueOnce(new Error('Simulated DB Failure'));
    const payload = {
      filePath: pngFile2,
      source: { name: 'Test Source 3', url: 'https://test3.com' },
      license: { name: 'CC0', url: 'https://test.com/license', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false },
    };
    
    // We expect ingestion to fail
    await expect(ingestionService.ingest(payload)).rejects.toThrow('Simulated DB Failure');
    
    // The spy should have been called
    expect(spy).toHaveBeenCalled();
    
    // Physical file should be deleted (how do we know which UUID it generated? we can check the storage directory is empty since we clear it, wait, it might have other tests' files. Let's just check the count of files in storageRoot)
    const files = fs.readdirSync(storageRoot);
    // the previous successful ingestion adds 1 file. So count should still be 1.
    expect(files.length).toBe(1);
    
    spy.mockRestore();
  });

  it('G. storage failure does not create DB record', async () => {
    const spy = vi.spyOn(assetStorage, 'store').mockRejectedValueOnce(new Error('Simulated Storage Failure'));
    const payload = {
      filePath: pngFile3,
      source: { name: 'Test Source 4', url: 'https://test4.com' },
      license: { name: 'CC0', url: 'https://test.com/license', status: 'approved' as const, commercialUse: true, modificationAllowed: true, attributionRequired: false },
    };
    
    await expect(ingestionService.ingest(payload)).rejects.toThrow('Simulated Storage Failure');
    
    // DB count should not change (it's 1 from first test)
    const assets = await repository.list();
    expect(assets.length).toBe(1);
    
    spy.mockRestore();
  });
});
