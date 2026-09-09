# 09 — Visual Critic

The Visual Critic evaluates compositions after rendering a preview.

## Evaluation dimensions

- focal point
- hierarchy
- readability
- balance
- density
- semantic relevance
- motion quality
- timing
- visual continuity
- narration/visual synchronization
- repetition
- clutter

## Decision

The Critic returns structured findings:

- `accept`
- `recompose`
- `reject`

A rejection must contain actionable reasons. Recomposition changes the composition specification through the Director/Matchmaker flow; the renderer itself remains deterministic.
