# 06 — Composition Engine

## Core idea

The Composition Engine solves a matchmaking problem:

> Given a visual intent and many available ingredients, which combination creates the strongest composition?

## Candidate generation

For each scene, generate multiple candidates containing combinations such as:

`background + subject + graphic + typography + overlay + motion + transition`

Not every scene requires every ingredient.

## Candidate scoring

Score candidates using weighted signals including:

- semantic relevance
- visual hierarchy
- focal-point clarity
- text readability
- negative-space fit
- style compatibility
- color harmony
- motion compatibility
- density
- narration energy match
- continuity with adjacent scenes
- asset diversity/reuse penalty
- license eligibility
- known historical performance

## Important rule

Individual asset quality must not determine the final choice. A mediocre-looking ingredient may be the best component of an excellent combination.

## Output

The Matchmaker returns structured composition candidates. The best candidate is selected only after validation and, where available, visual critique.
