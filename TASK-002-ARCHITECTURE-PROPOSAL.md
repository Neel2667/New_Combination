# TASK-002 ARCHITECTURE PROPOSAL

## 1. Canonical Asset Contract

Based on the specification audit, the canonical asset domain model should be structured as follows:

### Root Level
* FIELD: `id`
  * TYPE: `string`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema, Docs, Project Rules
  * PURPOSE: Unique identifier for the asset.
* FIELD: `type`
  * TYPE: `enum` (`video`, `image`, `svg`, `icon`, `illustration`, `audio`, `component`, `texture`, `effect`)
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema
  * PURPOSE: Core classification of the asset type.
* FIELD: `importedAt`
  * TYPE: `string` (ISO 8601 Date)
  * REQUIRED/OPTIONAL: Required
  * SOURCE: docs/04-ASSET-METADATA.md, PROJECT_RULES.md
  * PURPOSE: Tracks when the asset was introduced into the system for auditing and provenance.
* FIELD: `sha256`
  * TYPE: `string`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: docs/04-ASSET-METADATA.md, PROJECT_RULES.md
  * PURPOSE: Cryptographic hash to identify imported binaries and prevent duplicates/tampering.

### Source/Provenance (`source`)
* FIELD: `name`
  * TYPE: `string`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema, Docs
  * PURPOSE: Human-readable name of the source platform/provider.
* FIELD: `url`
  * TYPE: `string` (URI)
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema, Docs, Project Rules
  * PURPOSE: Direct link to the source for provenance tracking.
* FIELD: `author`
  * TYPE: `string`
  * REQUIRED/OPTIONAL: Optional (Required only when available)
  * SOURCE: JSON Schema, Docs, Project Rules
  * PURPOSE: Creator attribution.

### License (`license`)
* FIELD: `name`
  * TYPE: `string`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema, Docs
  * PURPOSE: Human-readable license name (e.g., "CC0", "Standard").
* FIELD: `url`
  * TYPE: `string` (URI)
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema, Docs
  * PURPOSE: Direct link to the license terms.
* FIELD: `status`
  * TYPE: `enum` (`approved`, `review`, `blocked`)
  * REQUIRED/OPTIONAL: Required
  * SOURCE: JSON Schema, Docs, Project Rules
  * PURPOSE: Explicit production gate status.
* FIELD: `commercialUse`
  * TYPE: `boolean`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: Docs, Project Rules
  * PURPOSE: Explicit flag indicating commercial viability.
* FIELD: `modificationAllowed`
  * TYPE: `boolean`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: Docs, Project Rules
  * PURPOSE: Explicit flag indicating whether the asset can be altered (e.g., cropped, recolored).
* FIELD: `attributionRequired`
  * TYPE: `boolean`
  * REQUIRED/OPTIONAL: Required
  * SOURCE: Docs, Project Rules
  * PURPOSE: Explicit flag for tracking legal attribution requirements in rendered compositions.

### Media (`media`)
* FIELD: `width`
  * TYPE: `number` (Integer)
  * REQUIRED/OPTIONAL: Optional (Required for visual types)
  * SOURCE: JSON Schema, Docs
  * PURPOSE: Original media width in pixels.
* FIELD: `height`
  * TYPE: `number` (Integer)
  * REQUIRED/OPTIONAL: Optional (Required for visual types)
  * SOURCE: JSON Schema, Docs
  * PURPOSE: Original media height in pixels.
* FIELD: `durationMs`
  * TYPE: `number` (Integer)
  * REQUIRED/OPTIONAL: Optional (Required for time-based media)
  * SOURCE: JSON Schema, Docs
  * PURPOSE: Media duration in milliseconds.
* FIELD: `hasAlpha`
  * TYPE: `boolean`
  * REQUIRED/OPTIONAL: Optional (Required for visual types)
  * SOURCE: JSON Schema, Docs (transparency)
  * PURPOSE: Indicates if the asset supports transparency.
* FIELD: `aspectRatio`
  * TYPE: `number`
  * REQUIRED/OPTIONAL: Optional (Required for visual types)
  * SOURCE: Docs, Project Rules
  * PURPOSE: Width/height ratio to enable geometric matchmaking.

### Visual Metadata (`visual`)
* FIELD: `subjects`, `tags`, `style`, `mood`, `energy`, `complexity`, `direction`, `focalArea`, `negativeSpace`, `textSafeArea`
  * TYPE: (Matching existing JSON Schema definitions)
  * REQUIRED/OPTIONAL: Optional
  * SOURCE: JSON Schema, Docs, Project Rules
  * PURPOSE: Granular aesthetic classification for the AI Matchmaker.
* FIELD: `colors`
  * TYPE: `object` (`{ dominant: string[], secondary: string[] }`)
  * REQUIRED/OPTIONAL: Optional
  * SOURCE: docs/04-ASSET-METADATA.md, PROJECT_RULES.md
  * PURPOSE: Hex or named color classifications for stylistic matching.
* FIELD: `motion`
  * TYPE: `enum` (`static`, `pan`, `zoom`, `timelapse`, `loop`, `erratic`)
  * REQUIRED/OPTIONAL: Optional
  * SOURCE: docs/04-ASSET-METADATA.md, PROJECT_RULES.md
  * PURPOSE: Describes camera or internal subject movement to match energy.
* FIELD: `suggestedFunctions`
  * TYPE: `array of enums` (matching visual-intent `function` enum)
  * REQUIRED/OPTIONAL: Optional
  * SOURCE: docs/04-ASSET-METADATA.md
  * PURPOSE: Hints at which narrative functions the asset serves best.
* FIELD: `compatibility`
  * TYPE: `object` (e.g., `{ darkBackground: boolean, lightText: boolean }`)
  * REQUIRED/OPTIONAL: Optional
  * SOURCE: docs/04-ASSET-METADATA.md
  * PURPOSE: Pre-computed traits for spatial and lighting compatibility.

## 2. Provenance

Provenance enforces accountability for every asset. The following representations are proposed:

* `source`, `sourceUrl`, `author`: These correctly belong in a nested `source` object. They track the origin of the asset.
* `license`, `licenseUrl`, `commercialUse`, `modificationAllowed`, `attributionRequired`: These belong in a nested `license` object, elevating the strict legal gating logic.
* `importedAt`: This should be a top-level asset property because it represents the system's relationship to the asset's lifecycle, not its origin.
* `sha256`: While currently in the `media` schema, **it is recommended to move `sha256` to the top-level asset schema.** A file hash is a foundational identity mechanism for the binary payload, directly tied to `importedAt` for audit logs, rather than a mere media characteristic like width or height.

## 3. Visual Metadata

Precise types for the newly identified visual metadata fields:

* **Aspect Ratio**: `number`. Storing the decimal ratio (e.g., `1.7778` for 16:9) allows the matchmaking engine to mathematically query assets that fit a CompositionFormat's bounding boxes without parsing strings.
* **Colors**: `{ dominant: string[], secondary: string[] }`. Hex strings (e.g., `#FFFFFF`). The matchmaker needs this to ensure visual consistency across scenes and prevent clashing transitions.
* **Motion Characteristics**: `enum` (`static`, `pan`, `zoom`, `loop`, `erratic`). The matchmaker needs this to match the `energy` of a Visual Intent (e.g., high-energy scenes need `erratic` or fast `pan`, not `static`).
* **Suggested Functions**: `array` of enums (matching the VisualIntent `function`: `hook`, `explain`, `cta`, etc.). This acts as a priority heuristic for the AI Matchmaker when scoring candidates.
* **Compatibility Metadata**: `object` containing boolean flags (e.g., `supportsLeftText: boolean`, `contrastsDarkBackground: boolean`). The matchmaker needs this to pair assets with procedural layout elements safely.

## 4. License Gate

* **Can a review asset be stored?** Yes. Assets ingested in bulk must be stored so they can be surfaced in a UI queue for human review.
* **Can a review asset enter a production composition?** No. Compositions rendered for production must fail validation if they contain any `review` asset.
* **Can a blocked asset enter a production composition?** No. Blocked assets are completely excluded from production.
* **What does the service layer validate?** The service layer explicitly validates that any asset retrieved for a *production composition context* has `license.status === 'approved'`.
* **What is the difference between "stored" and "production eligible"?** "Stored" means the asset exists in the database and meets the domain contract shape. "Production eligible" is a dynamic state enforced by the service layer, requiring `approved` status, explicitly verified provenance, and adherence to commercial-use constraints.

## 5. Database Boundary

**Proposed SQLite Data Model Architecture: Drizzle ORM**

* **Comparison**:
  * **Plain SQLite**: Extremely fast, zero dependencies, but requires manual mapping between SQL strings and TypeScript contracts, which is error-prone and violates strict typing.
  * **Prisma**: Heavy runtime engine, abstract schema file requires separate compilation step. Harder to cleanly decouple from domain contracts in a monorepo.
  * **Kysely**: Excellent type-safe query builder, but requires a separate schema definition or introspection.
  * **Drizzle ORM**: Lightweight, zero-dependency runtime. Schemas are defined in TypeScript.

* **Recommendation**: **Drizzle ORM** is strongly recommended. It defines schemas in pure TypeScript, which can flawlessly map to our Zod domain contracts. It satisfies the strict requirement to allow future PostgreSQL migration without changing domain contracts, as Drizzle dialects can be swapped easily while keeping the schema declarative.

* **Minimum SQLite Data Model**:
  A single `assets` table storing top-level fields (`id`, `type`, `importedAt`, `sha256`) and storing nested objects (`source`, `license`, `media`, `visual`) as JSON/JSONB columns. This prevents immediate schema fragmentation (avoiding 5 separate joined tables for a single asset document) while fulfilling TASK-002's requirement for asset models.

## 6. Repository Boundary

The `AssetRepository` defines the minimum persistence interface:

* `create(asset: Asset): Promise<void>`
* `getById(id: string): Promise<Asset | null>`
* `update(id: string, asset: Asset): Promise<void>`
* `delete(id: string): Promise<void>`
* `list(filters?: AssetFilters): Promise<Asset[]>`
* `listProductionEligible(): Promise<Asset[]>` (Filters specifically for `status === 'approved'`)

## 7. Service Boundary

Separation of concerns between `AssetRepository` and `AssetService`:

* **AssetRepository**: Strictly handles persistence. Executes raw SQL/Drizzle queries, maps DB rows back to the raw JSON structures, and handles pagination. It does NOT care if a license is approved or blocked, it only cares if the database transaction succeeds.
* **AssetService**: Contains business logic.
  * **Domain Validation**: Passes raw repository data through the Zod `validateContract(AssetSchema, data)`.
  * **Provenance Enforcement**: Rejects ingestion attempts if mandatory provenance data is missing, before calling the repository.
  * **License Gating**: Exposes methods like `getAssetForProduction(id)`, which fetches from the repository and throws a domain error if the asset is not `approved`.

## 8. Migration Strategy

SQLite migrations will be generated and managed via Drizzle-Kit (if Drizzle is selected).
* Migrations will be stored in `apps/backend/src/db/migrations`.
* A script (`npm run db:migrate`) will execute migrations on startup or deployment using `drizzle-orm/better-sqlite3` or a native driver.
* No migrations will be created during this audit phase.

## 9. Test Strategy

TASK-002 will require the following tests:
* **Schema Validation**: Tests confirming that Zod strictly accepts conforming shapes and rejects unknown/missing keys.
* **Required Provenance**: Tests explicitly rejecting payloads that lack `source`, `license`, `importedAt`, or `sha256`.
* **Hash Validation**: Tests ensuring `sha256` formatting or presence is enforced.
* **License States**: Tests confirming the enum strictly allows only `approved`, `review`, and `blocked`.
* **Production Eligibility**: Service-level tests confirming that a `review` or `blocked` asset throws an error when requested for a production composition.
* **Repository Persistence**: In-memory SQLite tests proving `create` and `getById` map DB JSON rows correctly back into the Zod schema.

## 10. Explicit Non-Goals

TASK-002 explicitly does **NOT** implement:
* Asset ingestion pipelines or APIs.
* External asset platform connections.
* Asset searching algorithms or UI.
* Matchmaking logic.
* LLM/AI prompt generation or Groq integration.
* Visual Critic processing.
* Rendering/Remotion execution.
* Frontend UI panels.

---

### PROJECT OWNER DECISIONS REQUIRED

1. **JSON Schema Authority vs. Project Rules**: `specs/asset.schema.json` currently marks critical license booleans (`commercialUse`, `modificationAllowed`) and `sha256` as optional, and omits `importedAt`, `aspectRatio`, and `motion`. Do you authorize modifying `specs/asset.schema.json` to enforce the strict requirements defined in `PROJECT_RULES.md` and `docs/04-ASSET-METADATA.md`?
2. **Hash Location**: Do you authorize moving `sha256` from the nested `media` object to the root `Asset` object alongside `importedAt` for stricter provenance tracking?
3. **Database Architecture**: Do you approve the use of Drizzle ORM with a JSON-column approach in SQLite to fulfill the requirement for "asset tables/models" while ensuring seamless future migration to PostgreSQL?
