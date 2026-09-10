# ARCHITECTURE AUDIT 001

## 1. Current System Audit

| Subsystem | Exists? | Production-ready? | Tests? | Missing pieces |
| --------- | ------- | ----------------- | ------ | -------------- |
| Frontend | STUB | No | No | React application, Asset library UI, Upload UI |
| Backend API | STUB | No | No | Asset controllers, multi-part upload handling, composition endpoints |
| Shared/Domain | EXISTS | Yes | Yes | None immediately |
| DB Layer | PARTIAL | Yes | Yes | Composition, scenes, and rendering job tables |
| Asset Ingestion | PARTIAL | No | Yes | Physical storage abstraction, rollback on DB failure |

The repository establishes a solid monorepo foundation with Zod domain contracts and SQLite/Drizzle persistence. However, it is highly disconnected: backend services process files without physical persistence, the REST API only exposes `/health`, and the frontend is an empty Vite stub. 

## 2. TASK-001 / TASK-002 / TASK-003 History and Status

**TASK-001 (Project Foundation):** 
- **Status:** Complete.
- **Current Quality:** High. NPM workspaces, TypeScript, Vitest, ESLint, and environment configurations are properly mapped.

**TASK-002 (Asset Model):**
- **Status:** Complete.
- **Current Quality:** High. Zod schemas meticulously capture the complex Asset model, including licenses, sources, and visual/media metadata.

**TASK-003 (Asset Ingestion):**
- **Status:** Headless / Incomplete Integration.
- **Current Quality:** The core domain logic is excellent (SHA-256 hashing works, media inspection via ffprobe/file is robust with strict exception handling, duplicate detection is tested). 
- **Remaining Weaknesses:** It intentionally leaves physical bytes at the `filePath` source without persisting them to a managed store. The orchestration is incomplete until `AssetStorage` is implemented, meaning it is currently unusable for a web-based upload flow.

## 3. Complete VCE Pipeline Audit

| Pipeline stage | Specified? | Implemented? | Testable? | Blocking gap |
| -------------- | ---------- | ------------ | --------- | ------------ |
| Script → Narration | MISSING | No | No | Lack of external API specification |
| Visual Intent | PARTIAL | No | No | AI Director contract missing |
| Composition Candidates | PARTIAL | No | No | Matchmaker scoring algorithm missing |
| Asset Matchmaking | PARTIAL | No | No | Matchmaker logic missing |
| Timeline + Layout Spec | PARTIAL | No | No | DB schema for Compositions missing |
| Validation / License Gate | YES | PARTIAL | Yes | Hooking up into Matchmaker |
| Renderer (Remotion) | YES | No | No | Implementation missing |
| Preview | YES | No | No | Renderer execution missing |
| Visual Critic | YES | No | No | Critic AI prompt/evaluation loop missing |
| Final Video | YES | No | No | Integration of the pipeline |

## 4. Architectural Gaps

- **Asset Foundation:** Missing physical asset storage abstraction, asset retrieval/streaming, and cleanup of orphaned files on DB failure.
- **Visual Pantry:** Missing completely. Needs an asset library UI, querying, and filtering logic.
- **Composition:** Missing domain persistence (SQLite tables for Composition/Scene) and backend timeline assembly logic.
- **API Boundaries:** Missing Asset upload, listing, and streaming endpoints.
- **AI Boundary:** Missing implementations for AI Director, Matchmaker, and Critic schemas.
- **Rendering:** Missing Remotion and FFmpeg integration for the rendering engine.

## 5. Dependency Graph

```text
Domain Contracts (EXISTS)
      ↓
Metadata Persistence & Ingestion Logic (EXISTS)
      ↓
Physical Asset Storage (MISSING)
      ↓
Asset REST API (Upload, List, Stream) (MISSING)
      ↓
Visual Pantry Frontend UI (MISSING)
      ↓
Composition Persistence & API (MISSING)
      ↓
AI Director / Tagging / Matchmaking (MISSING)
      ↓
Remotion Renderer (MISSING)
      ↓
Composition Editor / Visual Critic (MISSING)
```

## 6. Recommended Next Real Implementation Phase

**Phase Name:** Asset Management Integration (Vertical Slice)

**Why:** The project is currently fragmented. We have sophisticated backend logic that exists in a vacuum. To validate our architectural decisions, we must perform a vertical integration of the existing features. We need to connect physical file storage to our domain services, expose those services via REST APIs (handling multipart form uploads), and build the Visual Pantry UI to consume them. 

**Phase Scope:**
- `AssetStorage` implementation (Local Filesystem).
- Refactoring `AssetIngestionService` to use `AssetStorage` safely.
- Express API controllers/routes for asset upload, listing, and streaming.
- React components for the Visual Pantry (AssetGrid, UploadModal).

## 7. Proposed 5–8 Phase Roadmap

1. **Asset Management Integration (Vertical Slice)**
   - **Objective:** Wire up physical storage, REST API, and Frontend UI for the Visual Pantry.
   - **Depends on:** Existing Domain/Ingestion.
   - **Major components:** `AssetStorage`, Express API, React Asset UI.
   - **Expected product capability:** Users can upload, view, and retrieve real visual assets in the browser.
   - **Explicitly NOT included:** AI Tagging, Compositions.

2. **Composition Foundation**
   - **Objective:** Implement the composition domain model and persistence.
   - **Depends on:** Asset Management Integration.
   - **Major components:** SQLite schema for Compositions/Scenes, CRUD APIs.
   - **Expected product capability:** API consumers can create and validate scene timelines using existing asset references.
   - **Explicitly NOT included:** Visual editor UI, Renderer.

3. **Rendering Pipeline**
   - **Objective:** Connect validated compositions to the Remotion renderer.
   - **Depends on:** Composition Foundation.
   - **Major components:** Remotion project, FFmpeg integration, Render Job API.
   - **Expected product capability:** The system can turn a Composition JSON into an MP4 video preview.
   - **Explicitly NOT included:** AI Generation.

4. **AI Intelligence Core**
   - **Objective:** Integrate LLMs for semantic tagging, script parsing, and matchmaking.
   - **Depends on:** Rendering Pipeline.
   - **Major components:** AI Director service, Matchmaker algorithm, LLM API client.
   - **Expected product capability:** System auto-tags assets and proposes composition candidates from text prompts.
   - **Explicitly NOT included:** Human editing UI.

5. **Visual Editor & Critic**
   - **Objective:** Build the frontend UI for editing compositions and the AI Critic for visual feedback.
   - **Depends on:** AI Intelligence Core.
   - **Major components:** Timeline UI, Visual Critic evaluation loop.
   - **Expected product capability:** Users can edit AI-generated videos and receive automated design feedback.
   - **Explicitly NOT included:** Distributed cloud rendering.

## 8. Specification Gaps

- **AREA:** Asset Storage & API Integration
  - **WHY SPEC IS REQUIRED:** We need strict definitions for multipart upload handling, stream pipelining, and REST endpoint schemas before writing controllers.
  - **WHAT THE SPEC MUST DEFINE:** `AssetStorage` interface, `POST /api/assets` contract, pagination for `GET /api/assets`, and error boundary behavior (e.g., deleting orphaned files if DB fails).
- **AREA:** Composition Persistence
  - **WHY SPEC IS REQUIRED:** The Zod contracts are complex hierarchical scenes. We must decide whether to flatten them into relational tables or store them as JSON blobs.
  - **WHAT THE SPEC MUST DEFINE:** Database schema mapping for Compositions, Scenes, and MatchResults.

## 9. Architecture Risks

- **CRITICAL:** **Incremental fragmentation.** Continuing to build headless backend services without API/UI exposure hides integration bugs (e.g., partial DB failures leaving orphaned files).
- **HIGH:** **Memory exhaustion during uploads.** The upcoming API must use robust stream handling (e.g., Multer disk storage) rather than buffering large videos into RAM.
- **MEDIUM:** **Stale project state.** Internal tracking files (`project-state/CURRENT-TASK.md`) list `TASK-001` as active, which could confuse future agents or developers.
- **LOW:** **SQLite concurrency.** Will need WAL mode verified when API writes and renders increase.

## 10. Final Recommendation

**CURRENT STATE:** Foundation established. Headless backend domain exists for assets, but lacks the infrastructure (storage, API, UI) to be a usable application.

**TASK-003 STATUS:** Code is objectively complete and well-tested, but architecturally incomplete without a physical storage layer integration.

**MOST IMPORTANT MISSING FOUNDATION:** Physical Asset Storage and REST API Boundaries.

**RECOMMENDED NEXT PHASE:** Asset Management Integration (Vertical Slice)

**WHY:** We must connect the existing headless asset logic to physical storage, expose it via REST APIs, and build the UI. This proves the system works end-to-end before we introduce the complexity of Compositions or AI.

**PHASE SCOPE:** Physical Asset Storage implementation, Asset REST API (upload/list/stream), and Visual Pantry UI (React Frontend).

**REQUIRED SPECIFICATION:** Missing spec for Asset Storage & API Integration (TASK-004/TASK-005).

**AFTER THAT:** Composition Foundation -> Rendering Pipeline -> AI Intelligence Core -> Visual Editor & Critic.

**DO NOT IMPLEMENT:** No files outside of this audit documentation have been changed.
