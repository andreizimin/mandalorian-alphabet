---
parent: high-level-design
prefix: LAYOUT
---

# Layout

## Context and Design Philosophy

One codebase serves iPhone and iPad. Layout responds to width, not device type, so iPad Split View and Slide Over behave correctly.

## Breakpoints

| Width | Typical device | Controls |
|---|---|---|
| < 600 px | iPhone | Bottom bar (thumb reach) |
| 600 to 1024 px | iPad portrait, Split View | Top bar |
| > 1024 px | iPad landscape | Top bar |

## Reading Column

Single column, max line length about 65 characters, so iPad never shows ultra-wide lines. Text size 16 to 32 px, applied to both fonts equally.

## Quiz Screen

The quiz is a separate full-screen view opened in one tap from the reader controls. Its 4 answer choices form a 2 by 2 grid: in the lower half of the viewport under 600 px so one thumb reaches all four, centered under the prompt at wider widths.

## Platform

Tap targets at least 44 by 44 pt. Respect safe areas and system light or dark appearance. Page turns follow book direction: swipe left or tap the right edge zone to go forward, swipe right or tap the left edge zone to go back. Edge zones are the outer 15 % of the viewport width on each side, and only non-glyph points in them turn pages; a tap on a glyph anywhere is a peek (owned by `reader`), and a tap elsewhere does nothing.

## Reader Controls

The reader controls bar (bottom on phones, top on wider viewports) reaches each secondary screen in one tap: the legend, the quiz and the library.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Breakpoints | By width | By user agent | Handles Split View and future devices |
| iPad layout | Single column | Two columns in landscape | Simpler pagination; comfortable line length |
| Edge-zone width | Outer 15 % of viewport width | Fixed 44 pt strips | A proportional zone stays reachable on iPad and leaves most of a phone page for peeks |

## Open Questions & Future Decisions

### Resolved
1. ✅ Edge-tap zones are the outer 15 % of width; a glyph tap inside them is a peek, not a page turn.
