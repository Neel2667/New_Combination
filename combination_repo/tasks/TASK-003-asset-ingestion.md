# TASK-003 — Asset Ingestion

## Objective
Build a controlled ingestion service that imports approved assets while preserving provenance and license evidence.

## Requirements
- accept a source adapter or local asset
- create canonical asset metadata
- compute file hash
- record source and license information
- reject unknown/incompatible production licenses
- avoid duplicate imports by hash

## Acceptance criteria
- imported asset receives a stable ID
- provenance is persisted
- license gate executes before production eligibility
- duplicate content is detected
- ingestion behavior is tested
