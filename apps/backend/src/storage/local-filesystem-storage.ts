import * as fs from 'fs';
import * as path from 'path';
import { AssetStorage } from './asset-storage.interface';

export class StorageObjectNotFound extends Error {
  constructor(key: string) {
    super(`StorageObjectNotFound: No asset found for key ${key}`);
    this.name = 'StorageObjectNotFound';
  }
}

export class InvalidStorageKey extends Error {
  constructor(key: string) {
    super(`InvalidStorageKey: Key must be a valid UUID. Got: ${key}`);
    this.name = 'InvalidStorageKey';
  }
}

export class LocalFilesystemStorage implements AssetStorage {
  private readonly storageRoot: string;

  constructor(storageRoot: string) {
    this.storageRoot = path.resolve(storageRoot);
    if (!fs.existsSync(this.storageRoot)) {
      fs.mkdirSync(this.storageRoot, { recursive: true });
    }
  }

  private validateKey(key: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(key)) {
      throw new InvalidStorageKey(key);
    }
  }

  private getFilePath(key: string): string {
    this.validateKey(key);
    return path.join(this.storageRoot, `${key}.bin`);
  }

  async store(key: string, sourceFilePath: string): Promise<void> {
    const finalPath = this.getFilePath(key);
    const tempPath = `${finalPath}.tmp.${Date.now()}`;

    try {
      await fs.promises.copyFile(sourceFilePath, tempPath);
      await fs.promises.rename(tempPath, finalPath);
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        await fs.promises.unlink(tempPath).catch(() => {});
      }
      throw error;
    }
  }

  async getStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = this.getFilePath(key);
    
    if (!fs.existsSync(filePath)) {
      throw new StorageObjectNotFound(key);
    }
    
    return fs.createReadStream(filePath);
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.getFilePath(key);
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      const e = error as { code?: string };
      if (e.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
