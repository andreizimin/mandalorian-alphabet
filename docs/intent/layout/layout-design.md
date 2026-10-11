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

Tap targets at least 44 by 44 pt. Respect safe areas and system light or dark appearance. Page turns by horizontal swipe or edge tap.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Breakpoints | By width | By user agent | Handles Split View and future devices |
| iPad layout | Single column | Two columns in landscape | Simpler pagination; comfortable line length |

## Open Questions & Future Decisions

### Deferred
1. Edge-tap zones vs glyph peek: proposed outer 15% of width turns pages (see reader LLD).
