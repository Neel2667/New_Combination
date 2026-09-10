# TASK-004 — Asset Storage Abstraction

## Status
SPECIFICATION_READY

## Objective
Define a storage abstraction that manages the physical bytes for Assets, completely decoupling the Asset domain model from physical storage technology (e.g., local filesystem vs. future cloud/object storage).

## Background
TASK-003 implemented deterministic asset ingestion, media inspection, SHA-256 hashing, duplicate detection, and metadata persistence. Currently, physical files remain at their source location and are not managed by the system. We must safely persist physical bytes alongside metadata without polluting the `Asset` domain contract with infrastructure details like `filePath` or `url`.

## Scope
- Define the `AssetStorage` interface.
- Specify the initial `LocalFilesystemStorage` implementation.
- Establish a deterministic storage key strategy.
- Detail the security mechanisms (path traversal prevention, arbitrary execution prevention).
- Specify how storage integrates into the `AssetIngestionService` lifecycle.
- Define test requirements and acceptance criteria.

## Non-Goals
- Implementing Cloud storage providers (AWS S3, Google Cloud Storage, Cloudflare R2, etc.).
- Creating frontend UIs (Visual Pantry, asset browsers, uploaders).
- Performing media processing (transcoding, generating thumbnails, resizing).
- Adding arbitrary URLs or storage paths to the `Asset` schema.
- Creating new database tables for storage metadata.
- Searching or AI tagging.

## Architecture
- **Asset Domain**: Remains unaware of physical bytes and storage mechanisms.
- **Storage Abstraction**: An interface (`AssetStorage`) that represents a key-value byte store.
- **Implementation**: `LocalFilesystemStorage` class implementing `AssetStorage`.
- **Database Impact**: Zero. The physical location is implicitly and deterministically derived from the Asset ID.

## Storage Contract
The minimal storage interface to support current requirements:

```typescript
export interface AssetStorage {
  /**
   * Stores physical bytes from a local source file to the persistent storage.
   * @param key Unique identifier for the storage object.
   * @param sourceFilePath Absolute path to the source file to copy/move.
   */
  store(key: string, sourceFilePath: string): Promise<void>;

  /**
   * Retrieves a readable stream of the physical asset bytes.
   * @param key Unique identifier for the storage object.
   * @returns A Readable stream of the bytes.
   */
  getStream(key: string): Promise<NodeJS.ReadableStream>;

  /**
   * Checks if physical bytes exist for the given key.
   * @param key Unique identifier for the storage object.
   */
  exists(key: string): Promise<boolean>;

  /**
   * Deletes the physical bytes for the given key.
   * Should be idempotent (succeeds silently if the object doesn't exist).
   * @param key Unique identifier for the storage object.
   */
  delete(key: string): Promise<void>;
}
```

## Storage Key Strategy
- **Key Generation**: The physical storage key is exactly the `Asset.id` (which is a UUID).
- **Extension**: Files are stored without extensions (or with a uniform `.bin` extension) to decouple storage from mime-type assumptions and prevent accidental direct execution if the storage directory is misconfigured by a web server.
- **Content-Type**: Mime types will be derived from the database `Asset.type` (and potentially standard mapping tools) when the asset is served over HTTP in future tasks.
- **Mapping**: No database table is needed because `Asset ID === Storage Key`.

## Local Filesystem Implementation
The initial implementation, `LocalFilesystemStorage`, must:
- Be configured via an environment variable (e.g., `ASSET_STORAGE_ROOT`).
- Write files to `ASSET_STORAGE_ROOT/{key}`.
- Use atomic writes where possible (e.g., copying to a temporary file in the same directory, then renaming it to the final key) to prevent partial writes during unexpected crashes.
- Use core Node.js `fs` / `fs/promises` APIs. No shell commands (`cp`, `mv`) are allowed.

## Security Requirements
- **Path Traversal**: Keys must be validated against a strict regex (e.g., strict UUID format `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`) to absolutely prevent path traversal (`../`, `../../`, `/etc/passwd`).
- **Isolation**: The `ASSET_STORAGE_ROOT` must be located outside the public web root.
- **Arbitrary Filenames**: Under no circumstances can a user-provided filename be used as the storage key.

## Asset Lifecycle & Ingestion Integration
The `AssetIngestionService` must update its workflow to sequence storage safely:

1. Calculate Hash & Check Duplicates (fails if duplicate).
2. Inspect File Metadata (fails if invalid).
3. Construct `Asset` metadata (generating the new UUID).
4. **Physical Storage**: `AssetStorage.store(asset.id, payload.filePath)`.
5. **Database Persistence**: `AssetService.createAsset(asset)`.
6. **Failure Rollback**: If step 5 (Database) fails, the ingestion service MUST catch the error, call `AssetStorage.delete(asset.id)` to prevent orphaned files, and re-throw the error.

## Duplicate Handling
TASK-003 already rejects duplicate SHA-256 hashes at the ingestion boundary. No specific physical storage duplicate handling is required because a duplicate asset will be rejected before `AssetStorage.store` is ever invoked.

## Delete Behavior
When an asset is deleted from the domain (e.g., `AssetService.delete(id)`):
- The service must first delete the database record.
- The service then calls `AssetStorage.delete(id)`.
- If physical deletion fails, the error should be logged, but the asset is considered logically deleted. Orphaned files are preferable to failing a user's delete action due to a transient disk issue.
- Deletion in `AssetStorage` must be idempotent (no-op if the file is already gone).

## Database Impact
None. The Asset schema remains unchanged. No fields like `filePath` or `url` will be added. No new tables are introduced.

## Error Semantics
- Storage implementation should throw specific domain errors (e.g., `StorageObjectNotFound`, `StorageWriteError`).
- Missing object on `getStream` must throw a clear exception, not silently return an empty stream.
- The interface does not swallow missing-file errors on read.

## Test Requirements
- **Storage Implementation Tests**:
  - Tests use a temporary system directory (e.g., `os.tmpdir()`).
  - Verifies exact bytes can be stored and retrieved.
  - Verifies missing object on `getStream` throws a predictable error.
  - Verifies `delete` works and is idempotent.
  - Verifies path traversal attempts in the `key` argument throw validation errors immediately.
- **Integration Tests (`AssetIngestionService`)**:
  - Verifies successful ingestion results in both a database record and a physically stored file.
  - Verifies that if the database insertion is mocked to fail, the physically stored file is cleaned up (deleted) automatically.

## Acceptance Criteria
- `AssetStorage` interface is defined in the domain layer.
- `LocalFilesystemStorage` implements `AssetStorage` deterministically and securely.
- No storage-specific fields are added to the canonical `Asset` schema.
- Path traversal is strictly prevented via strict key validation.
- Bytes are preserved exactly without modification.
- Storage failures are explicitly surfaced.
- Ingestion orchestrates metadata validation, physical storage, and database persistence sequentially with rollback on DB failure.
- No new database tables are created.
- No cloud providers are required.
- Thorough tests cover success paths, failure cleanups, and security boundaries.

## Future Extensions
- A HTTP controller/endpoint to serve asset streams securely using `getStream(id)`.
- S3 / Object Storage implementation of `AssetStorage` for production deployments.

## Dependencies
- Native Node.js `fs`, `path`, and `stream` modules.
- No external runtime dependencies added.

## Risks
- Insufficient disk space could cause writes to fail; the rollback logic must properly handle partial writes/failures and bubble up the error cleanly.

## Open Decisions
- None. The architecture cleanly separates metadata and physical bytes.
