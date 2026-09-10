import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Asset } from '@combination/shared';
import { AssetIngestionService } from './asset-ingestion.service';
import { AssetService } from './asset.service';
import { AssetRepository } from '../repositories/asset.repository';
import { HashCalculator } from './hash-calculator';

vi.mock('./file-inspector');
vi.mock('./hash-calculator');

describe('AssetIngestionService (Unit)', () => {
  let repository: AssetRepository;
  let assetService: AssetService;
  let ingestionService: AssetIngestionService;

  beforeEach(() => {
    vi.clearAllMocks();

    repository = {
      findBySha256: vi.fn(),
    } as unknown as AssetRepository;

    assetService = {
      createAsset: vi.fn((a) => Promise.resolve(a)),
    } as unknown as AssetService;

    ingestionService = new AssetIngestionService(assetService, repository);
  });

  it('rejects if duplicate sha256 is found', async () => {
    vi.mocked(HashCalculator.calculateSha256).mockResolvedValue('fakehash');
    vi.mocked(repository.findBySha256).mockResolvedValue({ id: 'existing-id' } as Asset);
    
    await expect(ingestionService.ingest({
      filePath: 'fake.png',
      source: { name: 'A', url: 'https://a.com' },
      license: { name: 'A', url: 'https://a.com', status: 'approved', commercialUse: true, modificationAllowed: true, attributionRequired: false },
    })).rejects.toThrow(/Duplicate asset/);
  });
});
