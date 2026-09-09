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
        },
        license: {
          name: 'CC0',
          url: 'https://example.com/license',
          status: 'approved',
        },
        media: {
          width: 1920,
          height: 1080,
        },
        visual: {
          energy: 0.8,
        },
      };
      
      expect(isValidContract(AssetSchema, validAsset)).toBe(true);
      expect(() => validateContract(AssetSchema, validAsset)).not.toThrow();
    });

    it('should reject an invalid asset (missing required fields)', () => {
      const invalidAsset = {
        id: 'asset-1',
      };
      
      expect(isValidContract(AssetSchema, invalidAsset)).toBe(false);
      expect(() => validateContract(AssetSchema, invalidAsset)).toThrow();
    });

    it('should reject an invalid asset (incorrect type)', () => {
      const invalidAsset = {
        id: 'asset-1',
        type: 'unknown-type',
        source: { name: 'A', url: 'https://a.com' },
        license: { name: 'A', url: 'https://a.com', status: 'approved' },
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

    it('should reject an invalid visual intent', () => {
      const invalidIntent = {
        sceneId: 'scene-1',
        concept: 'Intro',
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

    it('should reject an invalid scene', () => {
      const invalidScene = {
        id: 'scene-1',
        startMs: -100,
        durationMs: 0,
        layers: [],
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

    it('should reject an invalid composition', () => {
      const invalidComposition = {
        id: 'comp-1',
        version: 0,
        format: {
          width: 0,
          height: 1080,
          fps: 30,
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

    it('should reject an invalid match result', () => {
      const invalidMatchResult = {
        sceneId: 'scene-1',
        candidates: [
          {
            id: 'candidate-1',
            score: 'high',
            assets: [],
          }
        ],
      };
      
      expect(isValidContract(MatchResultSchema, invalidMatchResult)).toBe(false);
    });
  });
});
