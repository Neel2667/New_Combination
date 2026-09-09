import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FileInspector } from './file-inspector';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('FileInspector', () => {
  const testDir = path.join(__dirname, 'test-assets-inspector');
  const pngFile = path.join(testDir, 'test.png');
  const svgFile = path.join(testDir, 'test.svg');
  const txtFile = path.join(testDir, 'test.txt');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // Create png
    execSync(`convert -size 100x200 xc:transparent ${pngFile}`);
    
    // Create svg
    fs.writeFileSync(svgFile, '<svg width="100" height="200" xmlns="http://www.w3.org/2000/svg"></svg>');
    
    // Create unsupported text file
    fs.writeFileSync(txtFile, 'not media');
  });

  afterAll(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('inspects a PNG image correctly', async () => {
    const result = await FileInspector.inspect(pngFile);
    expect(result.type).toBe('image');
    expect(result.width).toBe(100);
    expect(result.height).toBe(200);
    expect(result.aspectRatio).toBe(100 / 200);
    expect(result.hasAlpha).toBeDefined();
  });

  it('inspects an SVG image correctly', async () => {
    const result = await FileInspector.inspect(svgFile);
    expect(result.type).toBe('svg');
    // We expect graceful degradation if ffprobe can't parse it
    // SVG inspection is successful if type is svg
  });

  it('rejects unsupported files', async () => {
    await expect(FileInspector.inspect(txtFile)).rejects.toThrow(/Unsupported media type/);
  });
});
