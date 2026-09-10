export interface AssetStorage {
  store(key: string, sourceFilePath: string): Promise<void>;
  getStream(key: string): Promise<NodeJS.ReadableStream>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
}
