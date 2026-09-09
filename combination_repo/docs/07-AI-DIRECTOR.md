# 07 — AI Director

The Director converts narration into structured visual intent.

## Responsibilities

- understand the meaning of each narration segment
- identify the main concept
- identify emotional intent and attention level
- determine visual function
- identify subject/action relationships
- propose scene boundaries
- determine approximate visual energy
- provide constraints for the Matchmaker

## Non-responsibilities

The Director does not render video and does not output arbitrary image/video prompts as a replacement for the Pantry.

## Structured output

The Director must produce validated data conforming to `specs/visual-intent.schema.json`.
