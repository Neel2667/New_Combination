# 14 — Ingestion Sources

The Pantry can be populated from approved external sources and local/project assets.

## Source categories

- free stock media
- public-domain/CC0 assets
- permissively licensed icon/illustration libraries
- project-owned assets
- procedural components
- project-owned audio

## Ingestion contract

For every imported asset, retain source URL, creator where available, exact license information, license URL, import timestamp and content hash.

Source-wide licensing must not be treated as proof that an individual asset is production-safe when individual licenses differ.

## Initial integration philosophy

Prefer sources with clear commercial-use terms and machine-readable provenance. Never build production ingestion around scraping where the source terms prohibit it.
