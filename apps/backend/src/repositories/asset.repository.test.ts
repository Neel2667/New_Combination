import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { AssetRepository } from './asset.repository';
import * as schema from '../db/schema';
import path from 'path';
import { Asset } from '@combination/shared';

let db: ReturnType<typeof drizzle>;
let sqlite: Database.Database;
let repository: AssetRepository;

describe('AssetRepository', () => {
  beforeAll(() => {
    sqlite = new Database(':memory:');
    db = drizzle(sqlite, { schema });
    
    // Run migrations on in-memory db
    const migrationsFolder = path.join(__dirname, '../db/migrations');
    migrate(db, { migrationsFolder });

    repository = new AssetRepository(db as unknown as typeof import("../db").db); // cast because of slight type mismatch between db and defaultDb but they are functionally identical
  });

  afterAll(() => {
    sqlite.close();
  });

  it('can create and retrieve an asset', async () => {
    const asset = {
      id: 'repo-asset-1',
      type: 'video' as const,
      importedAt: '2023-10-01T12:00:00Z',
      source: { name: 'A', url: 'https://a.com' },
      license: {
        name: 'CC0',
        url: 'https://a.com/license',
        status: 'approved' as const,
        commercialUse: true,
        modificationAllowed: true,
        attributionRequired: false,
      },
      media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
      visual: {},
    };

    await repository.create(asset);
    
    const retrieved = await repository.getById('repo-asset-1');
    expect(retrieved).toEqual(asset);
  });

  it('can update an asset', async () => {
    const retrieved = await repository.getById('repo-asset-1');
    retrieved!.license.status = 'blocked';
    
    await repository.update('repo-asset-1', retrieved!);

    const updated = await repository.getById('repo-asset-1');
    expect(updated?.license.status).toBe('blocked');
  });

  it('can list assets', async () => {
    const list = await repository.list();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('repo-asset-1');
  });

  
  it('findBySha256 works', async () => {
    const retrieved = await repository.findBySha256('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd');
    expect(retrieved).not.toBeNull();
    
    const notFound = await repository.findBySha256('b1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd');
    expect(notFound).toBeNull();
  });

  it('can delete an asset', async () => {
    await repository.delete('repo-asset-1');
    const retrieved = await repository.getById('repo-asset-1');
    expect(retrieved).toBeNull();
  });

  it('listProductionEligible filters correctly', async () => {
    await repository.create({
      id: 'prod-1',
      type: 'video',
      importedAt: '2023-10-01T12:00:00Z',
      source: { name: 'A', url: 'https://a.com' },
      license: { name: 'A', url: 'https://a.com', status: 'approved', commercialUse: true, modificationAllowed: true, attributionRequired: false },
      media: { sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
      visual: {},
    } as Asset);

    await repository.create({
      id: 'review-1',
      type: 'video',
      importedAt: '2023-10-01T12:00:00Z',
      source: { name: 'B', url: 'https://b.com' },
      license: { name: 'B', url: 'https://b.com', status: 'review', commercialUse: true, modificationAllowed: true, attributionRequired: false },
      media: { sha256: 'b1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
      visual: {},
    } as Asset);

    await repository.create({
      id: 'blocked-1',
      type: 'video',
      importedAt: '2023-10-01T12:00:00Z',
      source: { name: 'C', url: 'https://c.com' },
      license: { name: 'C', url: 'https://c.com', status: 'blocked', commercialUse: true, modificationAllowed: true, attributionRequired: false },
      media: { sha256: 'c1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
      visual: {},
    } as Asset);

    await repository.create({
      id: 'noncomm-1',
      type: 'video',
      importedAt: '2023-10-01T12:00:00Z',
      source: { name: 'D', url: 'https://d.com' },
      license: { name: 'D', url: 'https://d.com', status: 'approved', commercialUse: false, modificationAllowed: true, attributionRequired: false },
      media: { sha256: 'd1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6abcd' },
      visual: {},
    } as Asset);

    const eligible = await repository.listProductionEligible();
    expect(eligible.length).toBe(1);
    expect(eligible[0].id).toBe('prod-1');
  });
});
