# Combination — AI Coding Agent Protocol

## 1. Purpose

This document defines how an AI coding agent (including Google AI Studio) must operate inside the Combination repository.

The repository is the persistent source of truth. Chat instructions are temporary; repository specifications and rules take precedence unless the project owner explicitly changes them.

## 2. Authority Order

When instructions conflict, use this order:

1. Explicit instruction from the project owner in the current task.
2. `PROJECT_RULES.md`.
3. Current task file in `tasks/`.
4. Relevant architecture documents in `docs/`.
5. Relevant JSON schemas in `specs/`.
6. Current project state in `project-state/`.
7. Existing implementation and tests.
8. Agent assumptions.

Never use assumption #8 to override a higher-level source.

## 3. Task Boundary

The agent works on exactly ONE task at a time.

Before coding:

- Read `PROJECT_RULES.md`.
- Read `README.md`.
- Read the current task file.
- Read every relevant document in `docs/`.
- Read every relevant schema in `specs/`.
- Inspect the existing implementation before changing it.
- Inspect recent Git history when the current implementation is unclear.

Do not implement a later task because it appears useful.

Do not silently combine tasks.

## 4. Required Workflow

The agent must follow:

SPECIFICATION → PLAN → IMPLEMENTATION → TEST → SELF-REVIEW → COMMIT → PUSH → REPORT

A task is not complete merely because code was generated.

## 5. Plan Before Implementation

Before changing files, produce a short plan containing:

- task requirements
- affected files
- new files
- dependencies
- tests
- risks
- architecture compliance

If an architectural ambiguity is discovered, stop and ask the project owner instead of guessing.

## 6. Repository Safety

Never:

- overwrite unrelated work
- delete files without task justification
- reset or force-push shared branches
- rewrite project history
- replace the agreed framework
- introduce a second database
- add unnecessary dependencies
- add secrets to source control
- modify unrelated features
- silently change schemas

If another change is detected while working, preserve it and report it.

## 7. Git Workflow

Preferred workflow for meaningful tasks:

1. Start from the latest `main`.
2. Create a task branch named `task/TASK-XXX-short-name`.
3. Make only task-related changes.
4. Commit with a clear message.
5. Push the branch.
6. Open a pull request when the environment supports it.
7. Do not merge the PR unless explicitly authorized.

If the environment cannot create branches or PRs, work only within the permitted branch and clearly report that limitation.

Never force-push.

## 8. Tests and Verification

Before declaring completion:

- run relevant unit/integration tests
- run TypeScript type checking
- run linting if configured
- run build validation when applicable
- verify the task acceptance criteria
- inspect the final diff

Report the actual commands and results.

Never claim a test passed unless it was executed successfully.

## 9. Schema Discipline

JSON schemas under `specs/` are contracts.

When code consumes or produces structured data:

- validate against the applicable schema
- keep types aligned with the schema
- do not invent undocumented fields
- do not silently loosen validation
- report intentional schema changes separately

## 10. AI Boundary

AI may make creative decisions only through structured domain contracts.

AI output must never be passed directly into rendering without validation.

The renderer executes validated composition specifications. It does not become an autonomous creative decision-maker.

## 11. Visual Composition Principle

The core principle is:

> THE COMPOSITION IS THE PRODUCT. ASSETS ARE INGREDIENTS.

Do not reduce the system to background + text + random animation.

The architecture must preserve the ability to match multiple visual ingredients according to semantic, spatial, temporal, stylistic and compositional relationships.

Do not implement future capabilities unless the current task requires them.

## 12. Asset and License Safety

Never guess an asset license.

Production assets require explicit provenance and license information.

Unknown or incompatible licensing status must not be treated as production-approved.

## 13. State Management

After a task is completed, update the project-state files as required:

- `project-state/CURRENT-TASK.md`
- `project-state/STATUS.md`
- `project-state/LAST-RESULT.md`
- `project-state/BLOCKERS.md` when blockers exist
- `project-state/DECISIONS.md` only when a project decision has actually been made

Do not advance `CURRENT-TASK.md` to the next task without explicit authorization.

## 14. Completion Report

Every task must end with:

TASK:
IMPLEMENTED:
FILES CREATED:
FILES MODIFIED:
DEPENDENCIES ADDED:
DATABASE CHANGES:
API CHANGES:
TESTS:
TYPE CHECK:
LINT:
BUILD:
ARCHITECTURE CHANGES:
SPECIFICATION DEVIATIONS:
BLOCKERS:
UNFINISHED:
COMMIT:
BRANCH:
PULL REQUEST:
NEXT TASK:

`NEXT TASK` is informational only. It must not be implemented automatically.

## 15. Stop Conditions

Stop and ask the project owner when:

- an architectural decision is required
- requirements conflict
- a schema change appears necessary but is not specified
- a security or licensing decision is required
- the task cannot be completed without changing unrelated architecture
- an existing feature would need to be removed or fundamentally redesigned

Do not solve these by silently guessing.

## 16. Anti-Hallucination Rule

Do not create fake completion.

Do not create fake APIs, fake database behavior, fake rendering, fake assets, fake test results, fake external integrations or simulated functionality while presenting them as production implementations.

If something is unavailable, report it.

## 17. Final Principle

The agent is an implementation worker, not the project architect.

Its job is to faithfully implement the approved specification, verify the result, document what changed, and stop.
