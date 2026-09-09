import { describe, it, expect } from 'vitest';
import {
  AssetSchema,
  VisualIntentSchema,
  SceneSchema,
  CompositionSchema,
  MatchResultSchema,
  validateContract,
  isValidContract,
} from '../index';

describe('Domain Contracts Validation', () => {
  describe('AssetSchema', () => {
    it('should validate a valid asset', () => {
      const validAsset = {
        id: 'asset-1',
        type: 'video',
        source: {
          name: 'Original File',
          url: 'https://example.com/video.mp4',
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
          sha256: 'a1b2c3d4e5f6',
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
        },
      };
      
      expect(isValidContract(AssetSchema, validAsset)).toBe(true);
      expect(() => validateContract(AssetSchema, validAsset)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidAsset = {
        id: 'asset-1',
        // missing type, source, license, media, visual
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid field types', () => {
      const invalidAsset = {
        id: 123, // should be string
        type: 'video',
        source: { name: 'A', url: 'https://a.com' },
        license: { name: 'A', url: 'https://a.com', status: 'approved' },
        media: {},
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid enum values', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'invalid-type', // invalid
        source: { name: 'A', url: 'https://a.com' },
        license: { name: 'A', url: 'https://a.com', status: 'approved' },
        media: {},
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid numeric ranges', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        source: { name: 'A', url: 'https://a.com' },
        license: { name: 'A', url: 'https://a.com', status: 'approved' },
        media: {
          width: 0, // minimum is 1
          height: 0, // minimum is 1
          durationMs: -1, // minimum is 0
        },
        visual: {
          energy: 1.5, // max 1
          complexity: -0.5, // min 0
        },
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should reject invalid nested structures', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        source: 'invalid', // should be object
        license: { name: 'A', url: 'https://a.com', status: 'approved' },
        media: {},
        visual: {},
      };
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
    });

    it('should validate valid boundary values', () => {
      const validAsset = {
        id: 'asset-1',
        type: 'video',
        source: { name: 'A', url: 'https://a.com' },
        license: { name: 'A', url: 'https://a.com', status: 'approved' },
        media: {
          width: 1, // min 1
          height: 1, // min 1
          durationMs: 0, // min 0
        },
        visual: {
          energy: 0, // min 0
          complexity: 1, // max 1
        },
      };
      expect(isValidContract(AssetSchema, validAsset)).toBe(true);
    });

    it('should reject invalid license/provenance data', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'video',
        source: { name: 'A', url: 'not-a-url' }, // invalid URL
        license: { name: 'A', url: 'https://a.com', status: 'unknown' }, // invalid status
        media: {},
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

    it('should reject missing required fields', () => {
      const invalidIntent = {
        sceneId: 'scene-1',
        concept: 'Intro',
        // missing function and energy
      };
      expect(isValidContract(VisualIntentSchema, invalidIntent)).toBe(false);
    });
    
    it('should reject invalid numeric ranges', () => {
      const invalidIntent = {
        sceneId: 'scene-1',
        concept: 'High energy intro',
        function: 'hook',
        energy: 1.5, // max 1
      };
      expect(isValidContract(VisualIntentSchema, invalidIntent)).toBe(false);
    });

    it('should reject invalid timing values', () => {
      const invalidIntent = {
        sceneId: 'scene-1',
        concept: 'High energy intro',
        function: 'hook',
        energy: 0.5,
        durationMs: 0, // minimum 1
      };
      expect(isValidContract(VisualIntentSchema, invalidIntent)).toBe(false);
    });
  });

  describe('SceneSchema', () => {
    it('should validate a valid scene', () => {
      const validScene = {
        id: 'scene-1',
        startMs: 0,
        durationMs: 5000,
        layers: [
          {
            id: 'layer-1',
            role: 'background',
          }
        ],
      };
      expect(isValidContract(SceneSchema, validScene)).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidScene = {
        id: 'scene-1',
        // missing startMs, durationMs, layers
      };
      expect(isValidContract(SceneSchema, invalidScene)).toBe(false);
    });

    it('should reject invalid timing values', () => {
      const invalidScene = {
        id: 'scene-1',
        startMs: -100, // min 0
        durationMs: 0, // min 1
        layers: [],
      };
      expect(isValidContract(SceneSchema, invalidScene)).toBe(false);
    });
    
    it('should reject invalid enum values in layers', () => {
      const invalidScene = {
        id: 'scene-1',
        startMs: 0,
        durationMs: 1000,
        layers: [
          {
            id: 'layer-1',
            role: 'invalid-role', // invalid
          }
        ],
      };
      expect(isValidContract(SceneSchema, invalidScene)).toBe(false);
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
        scenes: [
          {
            id: 'scene-1',
            startMs: 0,
            durationMs: 5000,
            layers: [],
          }
        ],
      };
      expect(isValidContract(CompositionSchema, validComposition)).toBe(true);
    });

    it('should reject invalid numeric ranges', () => {
      const invalidComposition = {
        id: 'comp-1',
        version: 0, // minimum 1
        format: {
          width: 0, // minimum 1
          height: 1080,
          fps: 0, // > 0
        },
        scenes: [],
      };
      expect(isValidContract(CompositionSchema, invalidComposition)).toBe(false);
    });

    it('should reject missing required fields in nested structures', () => {
      const invalidComposition = {
        id: 'comp-1',
        version: 1,
        format: {
          width: 1920,
          // missing height, fps
        },
        scenes: [],
      };
      expect(isValidContract(CompositionSchema, invalidComposition)).toBe(false);
    });
  });

  describe('MatchResultSchema', () => {
    it('should validate a valid match result', () => {
      const validMatchResult = {
        sceneId: 'scene-1',
        candidates: [
          {
            id: 'candidate-1',
            score: 0.95,
            assets: ['asset-1', 'asset-2'],
          }
        ],
      };
      expect(isValidContract(MatchResultSchema, validMatchResult)).toBe(true);
    });

    it('should reject invalid field types', () => {
      const invalidMatchResult = {
        sceneId: 'scene-1',
        candidates: [
          {
            id: 'candidate-1',
            score: 'high', // should be a number
            assets: [],
          }
        ],
      };
      expect(isValidContract(MatchResultSchema, invalidMatchResult)).toBe(false);
    });
  });
});
