# 16 — Roadmap

## Phase 0 — Constitution
- Project rules
- Architecture contract
- Domain terminology

## Phase 1 — Foundation
- TypeScript project structure
- SQLite schema/migrations
- shared domain types
- configuration and logging
- test infrastructure

## Phase 2 — Pantry
- asset model
- provenance/license model
- ingestion adapters
- metadata extraction
- asset search/filtering

## Phase 3 — Composition
- visual intent model
- scene model
- composition model
- candidate generation
- matchmaking/scoring
- diversity and compatibility memory

## Phase 4 — Rendering
- Remotion composition runtime
- deterministic render jobs
- FFmpeg media processing
- narration/music/SFX synchronization

## Phase 5 — Critic
- preview generation
- visual evaluation
- recomposition loop
- acceptance gates

## Phase 6 — Product UI
- Pantry browser
- composition workspace
- timeline
- preview/critic workflow
- render queue

## Phase 7 — Optimization
- learned compatibility graph
- performance feedback
- composition templates
- scaling and PostgreSQL migration path

Every phase is implemented through small tasks. A later phase must not silently bypass an earlier contract.
