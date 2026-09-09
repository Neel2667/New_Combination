import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { HashCalculator } from './hash-calculator';
import * as fs from 'fs';
import * as path from 'path';

describe('HashCalculator', () => {
  const testDir = path.join(__dirname, 'test-assets');
  const fileA = path.join(testDir, 'a.txt');
  const fileB = path.join(testDir, 'b.txt');
  const fileACopy = path.join(testDir, 'a-copy.txt');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(fileA, 'hello world');
    fs.writeFileSync(fileB, 'hello universe');
    fs.writeFileSync(fileACopy, 'hello world');
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('calculates sha256 for a file', async () => {
    const hash = await HashCalculator.calculateSha256(fileA);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('same content produces same hash', async () => {
    const hashA = await HashCalculator.calculateSha256(fileA);
    const hashACopy = await HashCalculator.calculateSha256(fileACopy);
    expect(hashA).toBe(hashACopy);
  });

  it('different content produces different hash', async () => {
    const hashA = await HashCalculator.calculateSha256(fileA);
    const hashB = await HashCalculator.calculateSha256(fileB);
    expect(hashA).not.toBe(hashB);
  });
});
