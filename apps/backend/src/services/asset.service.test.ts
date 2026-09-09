import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssetService } from './asset.service';
import { AssetRepository } from '../repositories/asset.repository';
import { Asset } from '@combination/shared';

describe('AssetService', () => {
  let repository: AssetRepository;
  let service: AssetService;

  beforeEach(() => {
    // Mock the repository
    repository = {
      create: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    } as unknown as AssetRepository;

    service = new AssetService(repository);
  });

  const validAsset: Asset = {
    id: 'asset-1',
    type: 'video',
    importedAt: '2023-10-01T12:00:00Z',
    source: { name: 'A', url: 'https://a.com' },
    license: {
      name: 'CC0',
      url: 'https://a.com/license',
      status: 'approved',
      commercialUse: true,
      modificationAllowed: true,
      attributionRequired: false,
    },
    media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
    visual: {},
  };

  describe('createAsset', () => {
    it('accepts valid asset', async () => {
      await expect(service.createAsset(validAsset)).resolves.toEqual(validAsset);
      expect(repository.create).toHaveBeenCalledWith(validAsset);
    });

    it('rejects invalid asset', async () => {
      const invalid = { ...validAsset, type: 'invalid' };
      await expect(service.createAsset(invalid)).rejects.toThrow();
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAssetForProduction', () => {
    it('returns approved compatible asset', async () => {
      vi.mocked(repository.getById).mockResolvedValue(validAsset);
      const result = await service.getAssetForProduction('asset-1');
      expect(result).toEqual(validAsset);
    });

    it('rejects review asset', async () => {
      vi.mocked(repository.getById).mockResolvedValue({
        ...validAsset,
        license: { ...validAsset.license, status: 'review' }
      });
      await expect(service.getAssetForProduction('asset-1')).rejects.toThrow(/review/);
    });

    it('rejects blocked asset', async () => {
      vi.mocked(repository.getById).mockResolvedValue({
        ...validAsset,
        license: { ...validAsset.license, status: 'blocked' }
      });
      await expect(service.getAssetForProduction('asset-1')).rejects.toThrow(/blocked/);
    });

    it('rejects non-commercial asset', async () => {
      vi.mocked(repository.getById).mockResolvedValue({
        ...validAsset,
        license: { ...validAsset.license, commercialUse: false }
      });
      await expect(service.getAssetForProduction('asset-1')).rejects.toThrow(/commercial use/);
    });

    it('throws if asset not found', async () => {
      vi.mocked(repository.getById).mockResolvedValue(null);
      await expect(service.getAssetForProduction('non-existent')).rejects.toThrow(/not found/);
    });
  });
});
