import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Asset } from '@combination/shared';
import { AssetIngestionService } from './asset-ingestion.service';
import { AssetService } from './asset.service';
import { AssetRepository } from '../repositories/asset.repository';
import { HashCalculator } from './hash-calculator';
import { AssetStorage } from '../storage/asset-storage.interface';
import { FileInspector } from './file-inspector';

vi.mock('./file-inspector');
vi.mock('./hash-calculator');

describe('AssetIngestionService (Unit)', () => {
  let repository: AssetRepository;
  let assetService: AssetService;
  let assetStorage: AssetStorage;
  let ingestionService: AssetIngestionService;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = {
      findBySha256: vi.fn(),
    } as unknown as AssetRepository;
    assetService = {
      createAsset: vi.fn((a) => Promise.resolve(a)),
    } as unknown as AssetService;
    assetStorage = {
      store: vi.fn(() => Promise.resolve()),
      getStream: vi.fn(),
      exists: vi.fn(),
      delete: vi.fn(() => Promise.resolve()),
    } as unknown as AssetStorage;
    ingestionService = new AssetIngestionService(assetService, repository, assetStorage);
  });

  it('rejects if duplicate sha256 is found', async () => {
    vi.mocked(HashCalculator.calculateSha256).mockResolvedValue('fakehash');
    vi.mocked(repository.findBySha256).mockResolvedValue({ id: 'existing-id' } as Asset);
    
    await expect(ingestionService.ingest({
      filePath: 'fake.png',
      source: { name: 'A', url: 'https://a.com' },
      license: { name: 'A', url: 'https://a.com', status: 'approved', commercialUse: true, modificationAllowed: true, attributionRequired: false },
    })).rejects.toThrow(/Duplicate asset/);

    expect(assetStorage.store).not.toHaveBeenCalled();
  });

  it('cleans up physical storage if database persistence fails', async () => {
    vi.mocked(HashCalculator.calculateSha256).mockResolvedValue('fakehash');
    vi.mocked(repository.findBySha256).mockResolvedValue(null);
    vi.mocked(FileInspector.inspect).mockResolvedValue({ type: 'image', width: 100, height: 100, hasAlpha: false });
    
    vi.mocked(assetService.createAsset).mockRejectedValue(new Error('DB Error'));

    await expect(ingestionService.ingest({
      filePath: 'fake.png',
      source: { name: 'A', url: 'https://a.com' },
      license: { name: 'A', url: 'https://a.com', status: 'approved', commercialUse: true, modificationAllowed: true, attributionRequired: false },
    })).rejects.toThrow(/DB Error/);

    expect(assetStorage.store).toHaveBeenCalled();
    expect(assetStorage.delete).toHaveBeenCalled();
  });
});
