# 01 — Architecture

## Objective
Define a modular composition platform in which visual quality comes from matching ingredients into compositions.

## Layers
1. **Ingestion** — discovers/imports assets and provenance.
2. **Pantry** — stores normalized assets and metadata.
3. **Semantic Index** — makes assets searchable by meaning and visual characteristics.
4. **Director** — converts narration into scene-level visual intent.
5. **Matchmaker** — generates and scores combinations of compatible ingredients.
6. **Composition Model** — represents the chosen arrangement as structured data.
7. **Validation** — schema, license, timing and safety gates.
8. **Renderer** — deterministic Remotion/FFmpeg execution.
9. **Critic** — evaluates rendered compositions and requests recomposition when needed.
10. **Memory/Analytics** — stores successful combinations, reuse history and performance signals.

## Boundary rule
UI, AI and ingestion must not directly manipulate rendering internals. Domain contracts connect the layers.

## Deployment
The first implementation targets a Docker-compatible environment such as Hugging Face Spaces. SQLite is the initial persistence layer. PostgreSQL may replace SQLite later without changing domain contracts.
