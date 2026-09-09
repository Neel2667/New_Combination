# 05 — License System

Licensing is a production gate, not a best-effort annotation.

## Requirements

No production asset may enter a composition unless its license status is explicitly known and compatible with the intended use.

Store the source URL, license name, license URL, author when available, commercial-use status, modification permission and attribution requirement.

## States

- `approved` — compatible for the configured production use.
- `review` — information exists but requires human verification.
- `blocked` — incompatible, restricted, non-commercial, or unknown.

The system must never infer a license from a filename, search result, or visual appearance.

## Source policy

The project may integrate free/open sources, but each source has its own terms. Individual asset licensing must be preserved. Bulk ingestion must retain provenance and must not assume that a site's general availability means every asset is commercially reusable.
