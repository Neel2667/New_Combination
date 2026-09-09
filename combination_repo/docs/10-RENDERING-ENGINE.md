# 10 — Rendering Engine

Remotion is the composition renderer; FFmpeg handles media processing where required.

## Rule

The renderer executes a validated composition specification. It does not decide what looks good and must not contain hardcoded creative decisions that belong to the Director/Matchmaker.

## Determinism

Same composition specification + same asset versions + same renderer version should produce reproducible output within documented rendering tolerances.

## Responsibilities

- resolve asset references
- execute scene timing
- render layers and typography
- apply declared animations/transitions
- synchronize narration, music and SFX
- produce final media
- report render metadata and errors
