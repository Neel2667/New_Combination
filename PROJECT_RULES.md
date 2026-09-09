# Visual Composition Engine — Project Rules

## 1. Purpose
The Visual Composition Engine (VCE) is a deterministic short-form video composition platform. It combines licensed visual ingredients and procedural components into high-quality compositions.

> **The composition is the product. Assets are ingredients.**

AI is the director, matchmaker and critic. It is not the renderer and does not replace the asset library with arbitrary AI-generated imagery/video.

## 2. Initial Stack
- Frontend: React + TypeScript
- Styling: Tailwind CSS
- Backend: Node.js + TypeScript
- API: REST
- Database: SQLite initially; PostgreSQL later without changing domain contracts
- Rendering: Remotion
- Media processing: FFmpeg
- LLM: Groq API
- Voice: Edge TTS
- Deployment: Docker-compatible hosting / Hugging Face Spaces
- Source control: Git/GitHub

## 3. Non-Negotiable Rules
1. Do not replace the architecture without explicit approval.
2. Do not invent features while implementing a task.
3. Do not silently change requirements.
4. Do not introduce a second database.
5. Do not put business logic into UI components.
6. Do not hardcode creative decisions into the renderer.
7. Do not use assets with unknown or incompatible licenses in production.
8. Do not make AI-generated graphics a prerequisite for the system.
9. Rendering must be deterministic from a composition specification.
10. Every meaningful feature requires tests.
11. Keep changes small and reviewable.
12. Preserve the existing working generator until the VCE migration is deliberately completed.

## 4. AI Role
AI may:
- understand scripts
- identify concepts and emotional intent
- identify visual functions
- select candidate assets
- select combinations of assets
- select layouts
- determine timing and animation parameters
- propose alternative compositions
- critique rendered previews

AI must return structured data conforming to schemas. Free-form creative output must never be directly passed to the renderer.

## 5. Renderer Role
The renderer executes a validated composition specification. It does not decide what looks good. Creative decisions belong to the Director/Matchmaker layer.

Same validated input + same asset versions + same renderer version must produce reproducible output within documented rendering tolerances.

## 6. Asset Rules
Every production asset must have:
- unique ID
- source
- source URL
- author where available
- license
- license URL
- commercial-use status
- modification status
- attribution requirement
- import date
- file hash
- media metadata

Visual metadata should include subject, semantic tags, style, mood, energy, complexity, color characteristics, motion, aspect ratio, transparency, focal area, negative space and text-safe areas where applicable.

## 7. License Gate
License information must never be guessed.

Allowed production status must be explicit. Unknown/restricted/non-commercial assets are blocked unless the project owner explicitly records a compatible license.

## 8. Composition First
A composition is a first-class object containing:
- scenes
- hierarchy
- layout
- asset relationships
- positions
- scales
- opacity
- colors
- animation
- typography
- transitions
- timing
- audio synchronization

An asset is evaluated in context, not only in isolation.

## 9. Development Workflow
Specification → Task → Implementation → Tests → Review → Accepted → Next Task

Never generate the entire application as one uncontrolled implementation.

## 10. Acceptance
A task is complete only when implementation, acceptance criteria and tests are satisfied, architecture remains compliant, and unrelated behavior was not changed.

## 11. Implementation Report
Every coding task must report:
TASK:
IMPLEMENTED:
FILES CHANGED:
DEPENDENCIES ADDED:
DATABASE CHANGES:
API CHANGES:
TESTS:
ARCHITECTURE CHANGES:
SPECIFICATION DEVIATIONS:
UNFINISHED:

## 12. Golden Rule
> **Do not invent. Do not redesign. Do not silently simplify.**

If the specification is ambiguous, document the ambiguity and ask before making an architectural decision.
