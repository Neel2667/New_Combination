# 12 — API

The API is a thin transport layer over domain services.

## Initial resource groups

- `/assets` — ingest, inspect, search and approve assets.
- `/licenses` — license/provenance records and eligibility.
- `/intents` — create and validate visual intent.
- `/compositions` — create, score, inspect and version compositions.
- `/renders` — submit and inspect deterministic render jobs.
- `/critic` — submit previews for structured evaluation.

## Rules

- Request/response schemas are explicit.
- Domain logic does not live in route handlers.
- AI responses are validated before entering domain services.
- API changes require tests and documentation updates.
