# Project Decisions

## Decision Log

### D-001 — Repository as Source of Truth

The Combination repository is the persistent source of truth for architecture, specifications, schemas, tasks, agent protocol and implementation state.

### D-002 — Task-by-Task Development

Implementation proceeds one approved task at a time. The coding agent must not automatically advance to later tasks.

### D-003 — Supervisor Review Gate

A task is not accepted solely because the coding agent reports success. The implementation is subject to review before the next task is authorized.
