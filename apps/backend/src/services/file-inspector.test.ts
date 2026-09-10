import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FileInspector } from './file-inspector';
import * as fs from 'fs';
import * as path from 'path';

describe('FileInspector', () => {
  const testDir = path.join(__dirname, 'test-assets-inspector');
  const pngFile = path.join(testDir, 'test.png');
  const svgFile = path.join(testDir, 'test.svg');
  const txtFile = path.join(testDir, 'test.txt');
  const missingFile = path.join(testDir, 'missing.png');
  const m4aFile = path.join(testDir, 'test.m4a');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // Tiny valid 1x1 PNG
    const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    fs.writeFileSync(pngFile, Buffer.from(pngBase64, 'base64'));
    
    // SVG
    fs.writeFileSync(svgFile, '<svg width="100" height="200" xmlns="http://www.w3.org/2000/svg"></svg>');
    
    // Unsupported text file
    fs.writeFileSync(txtFile, 'not media');

    // Tiny valid audio M4A
    const m4aBase64 = "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";
    fs.writeFileSync(m4aFile, Buffer.from(m4aBase64, 'base64'));
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('rejects missing files', async () => {
    await expect(FileInspector.inspect(missingFile)).rejects.toThrow(/FileNotFound/);
  });

  it('inspects a PNG image correctly', async () => {
    const result = await FileInspector.inspect(pngFile);
    expect(result.type).toBe('image');
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.aspectRatio).toBe(1);
    expect(result.hasAlpha).toBeDefined(); // The 1x1 has ya8 format, which implies alpha
  });

  it('inspects an SVG image correctly', async () => {
    const result = await FileInspector.inspect(svgFile);
    expect(result.type).toBe('svg');
    // We skip ffprobe for SVG now, so optional fields are undefined
    expect(result.width).toBeUndefined();
  });

  it('inspects an audio file correctly', async () => {
    const result = await FileInspector.inspect(m4aFile);
    expect(result.type).toBe('audio');
    expect(result.durationMs).toBeDefined();
    expect(result.durationMs).toBeGreaterThan(0);
  });

  it('rejects unsupported files', async () => {
    await expect(FileInspector.inspect(txtFile)).rejects.toThrow(/Unsupported media type/);
  });
});
