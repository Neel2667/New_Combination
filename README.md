# Combination

**Combination** is a visual composition engine for automated short-form video.

> **The composition is the product. Visual assets are ingredients.**

The system maintains a large library of licensed visual ingredients and procedural components. AI acts as a **Director, Matchmaker and Critic**: it understands the narration, selects compatible ingredients, assembles compositions, and critiques previews. The renderer executes the approved composition deterministically.

## Core pipeline

```text
Script
  ↓
Narration / Meaning Analysis
  ↓
Visual Intent
  ↓
Composition Candidates
  ↓
Asset Matchmaking
  ↓
Timeline + Layout Specification
  ↓
Validation / License Gate
  ↓
Remotion Renderer + FFmpeg
  ↓
Preview
  ↓
Visual Critic
  ↓
Accept / Recompose
  ↓
Final Video
```

## Principles

- Composition before individual assets.
- AI chooses from a controlled visual world rather than inventing production assets.
- Every production asset has explicit provenance and licensing metadata.
- Creative decisions are represented as structured data.
- The renderer executes specifications; it does not make creative decisions.
- Deterministic rendering is required.
- Small, testable implementation tasks only.
- No uncontrolled full-app generation.

## Initial stack

React + TypeScript, Tailwind CSS, Node.js + TypeScript, REST, SQLite, Remotion, FFmpeg, Groq, Edge TTS and Docker/Hugging Face Spaces.

## Repository map

- `PROJECT_RULES.md` — project constitution.
- `docs/` — architecture and system specifications.
- `specs/` — machine-readable domain contracts.
- `tasks/` — implementation tasks in dependency order.

## Status

Architecture/specification phase. No production renderer or asset database is considered complete until its corresponding task is accepted.
