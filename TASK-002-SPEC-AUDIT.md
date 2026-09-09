# TASK-002 SPECIFICATION AUDIT

## 1. Canonical Requirements

### specs/asset.schema.json
* `id` (string, required)
* `type` (enum, required)
* `source`: `name`, `url` (required), `author` (optional)
* `license`: `name`, `url`, `status` (required), `commercialUse`, `modificationAllowed`, `attributionRequired` (optional)
* `media`: `width`, `height`, `durationMs`, `hasAlpha`, `sha256` (all optional, but media object itself is required)
* `visual`: `subjects`, `tags`, `style`, `mood`, `energy`, `complexity`, `direction`, `focalArea`, `negativeSpace`, `textSafeArea` (all optional, but visual object itself is required)

### docs/04-ASSET-METADATA.md
* Provenance: `id`, `source`, `sourceUrl`, `author`, `license`, `licenseUrl`, `commercialUse`, `modificationAllowed`, `attributionRequired`, `importedAt`, `sha256`
* Visual metadata: `media type`, `duration`, `width/height`, `aspect ratio`, `transparency`, `subject`, `semantic tags`, `visual style`, `mood`, `energy`, `complexity`, `dominant/secondary color characteristics`, `motion characteristics`, `directionality`, `focal area`, `negative space`, `text-safe area`, `suggested functions`
* Compatibility metadata: relationship traits (e.g., works with dark backgrounds)

### docs/05-LICENSE-SYSTEM.md
* `source URL`, `license name`, `license URL`, `author` (when available), `commercial-use status`, `modification permission`, `attribution requirement`
* License States: `approved`, `review`, `blocked`

### PROJECT_RULES.md
* Production asset requires: `unique ID`, `source`, `source URL`, `author` (where available), `license`, `license URL`, `commercial-use status`, `modification status`, `attribution requirement`, `import date`, `file hash`, `media metadata`
* Visual metadata requires: `subject`, `semantic tags`, `style`, `mood`, `energy`, `complexity`, `color characteristics`, `motion`, `aspect ratio`, `transparency`, `focal area`, `negative space`, `text-safe areas` (where applicable)

### TASK-002
* Outputs: asset tables/models, migrations, repository/service layer, validation, unit tests
* Requirements: approved/review/blocked license states, mandatory provenance, hashes for binaries, metadata for matchmaking, tests for validation and license gating.

## 2. Conflict Matrix

FIELD: `importedAt` / `import date`
SPEC JSON: Missing.
DOCS: Required in provenance (`importedAt`).
PROJECT RULES: Required on all assets (`import date`).
TASK: "provenance is mandatory".
CONFLICT: Missing in JSON schema but required by Docs, Rules, and Task.
RECOMMENDED RESOLUTION: Add `importedAt` (string/date-time) as a required field in the JSON schema.

FIELD: `sha256` / `file hash`
SPEC JSON: Optional in `media`.
DOCS: Required in provenance.
PROJECT RULES: Required for every production asset.
TASK: "hashes can identify imported binaries".
CONFLICT: Optional in JSON schema vs required by Rules/Docs.
RECOMMENDED RESOLUTION: Make `sha256` required in the JSON schema `media` object.

FIELD: `commercialUse`, `modificationAllowed`, `attributionRequired`
SPEC JSON: Optional booleans in `license`.
DOCS: Required in provenance.
PROJECT RULES: Required for every production asset.
TASK: "approved/review/blocked license states are represented".
CONFLICT: Optional in JSON schema vs required by Rules/Docs.
RECOMMENDED RESOLUTION: Make these fields required booleans in the `license` object in the JSON schema.

FIELD: `aspect ratio`
SPEC JSON: Missing.
DOCS: Required in visual metadata.
PROJECT RULES: Required in visual metadata.
TASK: "metadata supports visual matchmaking".
CONFLICT: Missing in JSON schema.
RECOMMENDED RESOLUTION: Add `aspectRatio` (number) to the `media` object in the JSON schema.

FIELD: `color characteristics`
SPEC JSON: Missing.
DOCS: Required in visual metadata (`dominant/secondary color characteristics`).
PROJECT RULES: Required in visual metadata.
TASK: "metadata supports visual matchmaking".
CONFLICT: Missing in JSON schema.
RECOMMENDED RESOLUTION: Add `colors` (array or object) to the `visual` object in the JSON schema.

FIELD: `motion`
SPEC JSON: Missing.
DOCS: Required in visual metadata (`motion characteristics`).
PROJECT RULES: Required in visual metadata.
TASK: "metadata supports visual matchmaking".
CONFLICT: Missing in JSON schema.
RECOMMENDED RESOLUTION: Add `motion` (string) to the `visual` object in the JSON schema.

FIELD: `suggested functions` & compatibility metadata
SPEC JSON: Missing.
DOCS: Required in metadata.
PROJECT RULES: N/A.
TASK: "metadata supports visual matchmaking".
CONFLICT: Missing in JSON schema.
RECOMMENDED RESOLUTION: Add `suggestedFunctions` (array of strings) and `compatibility` to the `visual` object in the JSON schema.

## 3. Current Implementation Audit

FIELD: `import date` / `importedAt`
CURRENT IMPLEMENTATION: Missing.
REQUIRED SOURCE: PROJECT_RULES.md, docs/04-ASSET-METADATA.md
PROBLEM: The Zod schema drops this field because it follows the incomplete JSON schema.

FIELD: `aspect ratio`, `color characteristics`, `motion`, `suggested functions`
CURRENT IMPLEMENTATION: Missing.
REQUIRED SOURCE: PROJECT_RULES.md, docs/04-ASSET-METADATA.md
PROBLEM: Not validated or stored; missing from Zod schema due to incomplete JSON schema.

FIELD: `sha256`, `commercialUse`, `modificationAllowed`, `attributionRequired`
CURRENT IMPLEMENTATION: Optional.
REQUIRED SOURCE: PROJECT_RULES.md, docs/04-ASSET-METADATA.md
PROBLEM: Validated as optional instead of required, which violates the strict production rules.

FIELD: Asset Tables, Models, Migrations
CURRENT IMPLEMENTATION: Missing.
REQUIRED SOURCE: TASK-002
PROBLEM: The previous implementation only created validation contracts (Zod) in `packages/shared`. It completely failed to implement the required database layer (SQLite tables, migrations, models).

FIELD: Repository / Service Layer
CURRENT IMPLEMENTATION: Missing.
REQUIRED SOURCE: TASK-002
PROBLEM: No service layer was built for license gating, CRUD, or database interaction.

## 4. TASK Boundary Audit

REQUIRED FOR TASK-002:
* Validation schemas (Zod contracts)
* Database configuration (SQLite initially)
* Asset database tables and migrations
* Asset Repository (CRUD operations)
* Asset Service Layer (license gating, provenance enforcement)
* Unit tests for validation, repository, and service layer

NOT REQUIRED / FUTURE TASK:
* Asset ingestion logic/API (belongs to TASK-003)
* Asset search and matchmaking (belongs to TASK-004)
* Visual Critic (belongs to TASK-007)
* Rendering / Remotion (belongs to TASK-010)
* AI/Groq integration
* Frontend UI

## 5. Schema Change Assessment

`specs/asset.schema.json` NEEDS TO CHANGE. 
It is currently missing critical fields mandated by `PROJECT_RULES.md` and `docs/04-ASSET-METADATA.md`, and it loosely marks required provenance fields (`sha256`, license booleans) as optional. Because `PROJECT_RULES.md` dictates strict license gating and exact metadata fields, the JSON schema must be updated to enforce these rules.

## 6. Database / Repository Assessment

TASK-002 explicitly requires "asset tables/models", "migrations", and "repository/service layer". 
The current implementation completely ignored these requirements. Based on `PROJECT_RULES.md` ("SQLite initially; PostgreSQL later without changing domain contracts"), the project requires a database library or ORM (e.g., Drizzle, Prisma, or Kysely) to define tables and migrations for the backend. The task specification is sufficient to start the database layer, but the missing fields in the JSON schema block creating the *correct* table schema.

## 7. Required Implementation Changes

* file: `specs/asset.schema.json`
  * exact reason: Missing required documentation fields and incorrect optional flags.
  * source requirement: PROJECT_RULES.md, docs/04-ASSET-METADATA.md
  * expected behavior: Accurately reflect all provenance and visual metadata fields as defined in the docs.
  * test requirement: None directly.

* file: `packages/shared/src/contracts/asset.ts`
  * exact reason: Needs to match the updated JSON schema.
  * source requirement: TASK-002 Validation requirement.
  * expected behavior: Validates all new fields, rejecting missing required fields (e.g., `sha256`, `importedAt`).
  * test requirement: Update `contracts.test.ts` to verify the new required fields.

* file: `apps/backend/src/db/schema.ts` (New)
  * exact reason: Asset tables/models are a required output.
  * source requirement: TASK-002, PROJECT_RULES.md (SQLite)
  * expected behavior: Defines the Asset database tables mapping exactly to the domain contract.
  * test requirement: N/A (Declarative).

* file: `apps/backend/src/db/migrations/*` (New)
  * exact reason: Migrations are a required output.
  * source requirement: TASK-002
  * expected behavior: Creates the SQLite tables on startup or via script.
  * test requirement: N/A.

* file: `apps/backend/src/repositories/asset.repository.ts` (New)
  * exact reason: Repository layer is a required output.
  * source requirement: TASK-002
  * expected behavior: Handles SQLite queries for saving and retrieving assets.
  * test requirement: Unit tests verifying CRUD functionality.

* file: `apps/backend/src/services/asset.service.ts` (New)
  * exact reason: Service layer and license gating are required.
  * source requirement: TASK-002, PROJECT_RULES.md
  * expected behavior: Validates incoming assets via Zod, enforces license state logic (e.g., blocks "unknown" licenses from being stored as "approved").
  * test requirement: Unit tests for license gating logic.

## 8. FINAL VERDICT

SPECIFICATION AMBIGUITY — PROJECT OWNER DECISION REQUIRED
