import { describe, it, expect } from 'vitest';
import { APP_NAME, APP_VERSION } from './index';

describe('Shared domain constants', () => {
  it('defines correct APP_NAME', () => {
    expect(APP_NAME).toBe('Combination');
  });

  it('defines valid APP_VERSION', () => {
    expect(APP_VERSION).toBe('0.1.0');
  });
});
