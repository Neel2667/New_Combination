# TASK-004 — Asset Storage Abstraction

## Objective
Provide a safe, isolated physical storage layer for asset bytes, ensuring deterministic retrieval and strict lifecycle management decoupled from the database.

## Requirements
- `AssetStorage` interface: `store`, `getStream`, `exists`, `delete`
- `LocalFilesystemStorage` implementation using `ASSET_STORAGE_ROOT`
- use deterministic storage key (Asset ID)
- path traversal protection
- atomic/safe storage (e.g. rename from temporary)
- ingestion integration: rollback on DB failure
- duplicate handling
- deletion semantics: idempotent delete
- storage error semantics
- storage tests
- ingestion integration tests

## Acceptance criteria
- Interface abstracts physical storage
- Local files are stored securely based on Asset ID UUIDs
- Tests demonstrate proper persistence and DB-failure rollback
- Replaces raw file paths in ingestion
