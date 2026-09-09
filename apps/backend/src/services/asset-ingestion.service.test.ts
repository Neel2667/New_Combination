import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Asset } from "@combination/shared";
import { AssetIngestionService } from './asset-ingestion.service';
import { AssetService } from './asset.service';
import { AssetRepository } from '../repositories/asset.repository';
import * as fs from 'fs';
import * as path from 'path';

describe('AssetIngestionService', () => {
  let repository: AssetRepository;
  let assetService: AssetService;
  let ingestionService: AssetIngestionService;

  const testDir = path.join(__dirname, 'test-assets-ingestion');
  const pngFile = path.join(testDir, 'test.png');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(pngFile, 'fake png content'); // not a real PNG, but HashCalculator will still work. FileInspector will fail if it's not a real png.
    // wait, FileInspector actually runs `file` and `ffprobe`. We should mock FileInspector.
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    repository = {
      findBySha256: vi.fn(),
    } as unknown as AssetRepository;

    assetService = {
      createAsset: vi.fn((a) => Promise.resolve(a)),
    } as unknown as AssetService;

    ingestionService = new AssetIngestionService(assetService, repository);
  });

  it('rejects if duplicate sha256 is found', async () => {
    vi.mocked(repository.findBySha256).mockResolvedValue({ id: 'existing-id' } as Asset);
    
    await expect(ingestionService.ingest({
      filePath: pngFile,
      source: { name: 'A', url: 'https://a.com' },
      license: { name: 'A', url: 'https://a.com', status: 'approved', commercialUse: true, modificationAllowed: true, attributionRequired: false },
    })).rejects.toThrow(/Duplicate asset/);
  });
  
  // We can write an integration test that uses actual files and real FileInspector
});
