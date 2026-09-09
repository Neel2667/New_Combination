# TASK-002 — Asset Model

## Objective
Implement the canonical asset, provenance and license domain model.

## Inputs
- `specs/asset.schema.json`
- `docs/04-ASSET-METADATA.md`
- `docs/05-LICENSE-SYSTEM.md`

## Outputs
- asset tables/models
- migrations
- repository/service layer
- validation
- unit tests

## Acceptance criteria
- approved/review/blocked license states are represented
- provenance is mandatory
- hashes can identify imported binaries
- metadata supports visual matchmaking
- tests cover validation and license gating
