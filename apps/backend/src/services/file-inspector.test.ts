import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FileInspector } from './file-inspector';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

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

    // Deterministic valid audio M4A generated using ffmpeg
    execFileSync('ffmpeg', [
      '-f', 'lavfi',
      '-i', 'sine=frequency=1000:duration=0.1',
      '-c:a', 'aac',
      '-y', m4aFile
    ], { stdio: 'ignore' });
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
