# TASK-005 — Composition Model

## Objective
Implement the first-class composition domain model and validation rules.

## Inputs
- `specs/composition.schema.json`
- `specs/scene.schema.json`
- `docs/06-COMPOSITION-ENGINE.md`

## Requirements
- immutable accepted versions
- ordered scenes
- layer hierarchy
- asset references
- transforms
- typography declarations
- animation/timing declarations
- audio references

## Acceptance criteria
- valid compositions pass schema/domain validation
- invalid references and timing are rejected
- composition versions are reproducible
- unit tests cover hierarchy and timing
