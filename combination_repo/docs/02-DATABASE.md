# 02 — Database

SQLite is the initial database. Domain models must remain portable to PostgreSQL.

## Core entities

- `assets` — canonical visual/audio ingredient records.
- `asset_sources` — source and provenance records.
- `licenses` — explicit license facts and production eligibility.
- `asset_tags` — semantic and visual tags.
- `compositions` — composition specifications and versions.
- `composition_assets` — asset participation in compositions.
- `scenes` — ordered composition scenes.
- `composition_scores` — candidate and critic scores.
- `render_jobs` — deterministic render requests/results.
- `usage_history` — recent-use tracking for diversity.
- `compatibility_edges` — learned compatibility between ingredients.

## Rules

- Every persistent record has a stable ID.
- Asset binaries are not stored as opaque database blobs by default; metadata points to managed storage.
- Composition versions are immutable after acceptance.
- Deletes should preserve provenance/history where practical.
- Schema migrations are explicit and tested.
