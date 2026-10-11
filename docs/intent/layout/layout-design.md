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

## Page Turning

Every way of turning a page maps to the same two actions, forward and back, which `content` executes:

- **Touch:** swipe and edge-tap zones (see Platform).
- **Buttons:** a page-turn bar with a back button and a forward button, fixed to the bottom of the viewport (above the safe area) at every width. It never moves with the length of the text, so the learner's thumb or cursor finds it in the same place on every page. The back button is disabled on the first page. The reading column reserves space at the bottom so text never sits under the bar.
- **Keyboard:** on a laptop, Right Arrow turns forward and Left Arrow turns back. Keys are ignored while focus is in a text field (so the paste box keeps normal cursor movement) and when Cmd, Ctrl or Alt is held (so browser shortcuts like Cmd+Left still work).

## Reader Controls

The reader controls bar (bottom on phones, top on wider viewports) reaches each secondary screen in one tap: the legend, the quiz and the library.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Breakpoints | By width | By user agent | Handles Split View and future devices |
| iPad layout | Single column | Two columns in landscape | Simpler pagination; comfortable line length |
| Page-turn buttons | Fixed bar at the bottom of the viewport | Button after the text; floating arrows at mid-height | A button after the text moves with every page's length; a bottom bar stays put and is in thumb reach on a phone |
| Keyboard turns | Left and Right Arrow, ignored in text fields and with modifier keys | Space and Page Down as well | Arrows match the book direction of swipes; Space would also scroll and collide with typing |
| Edge-zone width | Outer 15 % of viewport width | Fixed 44 pt strips | A proportional zone stays reachable on iPad and leaves most of a phone page for peeks |

## Open Questions & Future Decisions

### Resolved
1. ✅ Edge-tap zones are the outer 15 % of width; a glyph tap inside them is a peek, not a page turn.
