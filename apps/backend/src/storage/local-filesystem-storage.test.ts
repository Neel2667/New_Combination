import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LocalFilesystemStorage, StorageObjectNotFound, InvalidStorageKey } from './local-filesystem-storage';
import * as crypto from 'crypto';

describe('LocalFilesystemStorage', () => {
  let storageRoot: string;
  let storage: LocalFilesystemStorage;

  beforeEach(() => {
    storageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vce-storage-test-'));
    storage = new LocalFilesystemStorage(storageRoot);
  });

  afterEach(() => {
    fs.rmSync(storageRoot, { recursive: true, force: true });
  });

  it('should store and retrieve a file successfully', async () => {
    const key = crypto.randomUUID();
    const sourceFilePath = path.join(storageRoot, 'source.txt');
    fs.writeFileSync(sourceFilePath, 'hello world');

    await storage.store(key, sourceFilePath);

    const exists = await storage.exists(key);
    expect(exists).toBe(true);

    const stream = await storage.getStream(key) as fs.ReadStream;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString('utf-8');
    expect(content).toBe('hello world');
  });

  it('should throw StorageObjectNotFound for missing file', async () => {
    const key = crypto.randomUUID();
    await expect(storage.getStream(key)).rejects.toThrowError(StorageObjectNotFound);
  });

  it('should return false for exists on missing file', async () => {
    const key = crypto.randomUUID();
    expect(await storage.exists(key)).toBe(false);
  });

  it('should delete a file', async () => {
    const key = crypto.randomUUID();
    const sourceFilePath = path.join(storageRoot, 'source.txt');
    fs.writeFileSync(sourceFilePath, 'hello world');

    await storage.store(key, sourceFilePath);
    expect(await storage.exists(key)).toBe(true);

    await storage.delete(key);
    expect(await storage.exists(key)).toBe(false);
  });

  it('should be idempotent on delete', async () => {
    const key = crypto.randomUUID();
    await storage.delete(key); // Should not throw
    expect(await storage.exists(key)).toBe(false);
  });

  it('should prevent path traversal by validating UUID', async () => {
    const invalidKey = '../secret';
    await expect(storage.exists(invalidKey)).rejects.toThrowError(InvalidStorageKey);
    await expect(storage.getStream(invalidKey)).rejects.toThrowError(InvalidStorageKey);
    await expect(storage.delete(invalidKey)).rejects.toThrowError(InvalidStorageKey);
    
    const sourceFilePath = path.join(storageRoot, 'source.txt');
    fs.writeFileSync(sourceFilePath, 'data');
    await expect(storage.store(invalidKey, sourceFilePath)).rejects.toThrowError(InvalidStorageKey);
  });
});
