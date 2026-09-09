import { describe, it, expect } from 'vitest';
import { AssetSchema } from '../asset';
import { CompositionSchema } from '../composition';
import { MatchResultSchema } from '../match-result';
import { SceneSchema } from '../scene';
import { VisualIntentSchema } from '../visual-intent';
import { validateContract, isValidContract } from '../validate';

describe('Contracts', () => {
  describe('AssetSchema', () => {
    it('should validate a perfectly valid asset', () => {
      const validAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        source: {
          name: 'Pexels',
          url: 'https://pexels.com/video/123',
          author: 'John Doe',
        },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: {
          width: 1920,
          height: 1080,
          durationMs: 5000,
          hasAlpha: false,
          aspectRatio: 1.777,
          sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd',
        },
        visual: {
          subjects: ['person'],
          tags: ['happy', 'sunny'],
          style: 'cinematic',
          mood: 'joyful',
          energy: 0.8,
          complexity: 0.5,
          direction: 'left',
          focalArea: 'center',
          negativeSpace: 'top',
          textSafeArea: 'center',
          colors: {
            dominant: ['#FF0000'],
            secondary: ['#00FF00'],
          },
          motion: 'pan',
          suggestedFunctions: ['hook', 'cta'],
          compatibility: {
            darkBackground: true,
          }
        },
      };
      
      expect(isValidContract(AssetSchema, validAsset)).toBe(true);
      expect(() => validateContract(AssetSchema, validAsset)).not.toThrow();
    });

    it('should reject missing provenance', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        // source missing
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject missing importedAt', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });
    
    it('should reject missing required license fields', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          // commercialUse missing
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid license state', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'unknown', // invalid
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid URI', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        source: { name: 'A', url: 'not-a-uri' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid importedAt', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: 'yesterday',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid hash', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'short-hash' }, // Not 64 hex
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid energy/complexity ranges', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {
          energy: 1.5, // max 1
        },
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject unexpected properties due to strict mode', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        importedAt: '2023-10-01T12:00:00Z',
        unknownProp: 'test',
        source: { name: 'A', url: 'https://a.com' },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
          commercialUse: true,
          modificationAllowed: true,
          attributionRequired: false,
        },
        media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });
  });

  describe('VisualIntentSchema', () => {
    it('should validate a valid visual intent', () => {
      const validIntent = {
        sceneId: 'scene-1',
        concept: 'High energy intro',
        function: 'hook',
        energy: 0.9,
      };
      expect(isValidContract(VisualIntentSchema, validIntent)).toBe(true);
    });
  });

  describe('SceneSchema', () => {
    it('should validate a valid scene', () => {
      const validScene = {
        id: 'scene-1',
        startMs: 0,
        durationMs: 5000,
        layers: [],
      };
      expect(isValidContract(SceneSchema, validScene)).toBe(true);
    });
  });

  describe('CompositionSchema', () => {
    it('should validate a valid composition', () => {
      const validComposition = {
        id: 'comp-1',
        version: 1,
        format: {
          width: 1920,
          height: 1080,
          fps: 30,
        },
        scenes: [],
      };
      expect(isValidContract(CompositionSchema, validComposition)).toBe(true);
    });
  });

  describe('MatchResultSchema', () => {
    it('should validate a valid match result', () => {
      const validMatchResult = {
        sceneId: 'scene-1',
        candidates: [],
      };
      expect(isValidContract(MatchResultSchema, validMatchResult)).toBe(true);
    });
  });
});
