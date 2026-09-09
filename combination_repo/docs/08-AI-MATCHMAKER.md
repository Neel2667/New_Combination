# 08 — AI Matchmaker

The Matchmaker is the combination-selection layer.

## Input

- visual intent
- eligible Pantry assets
- composition constraints
- scene duration
- narration timing
- neighboring scene context
- usage/reuse history
- learned compatibility data

## Process

1. Filter assets by license and hard constraints.
2. Retrieve semantically relevant candidates.
3. Build multiple combinations.
4. Score combinations rather than isolated assets.
5. Apply diversity and continuity penalties/bonuses.
6. Return ranked candidates.

## Learning

Accepted compositions and measured performance may create compatibility edges. These are recommendations, not permanent rules; the system must retain the ability to explore new combinations.
