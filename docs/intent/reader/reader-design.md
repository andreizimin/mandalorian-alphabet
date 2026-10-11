---
parent: high-level-design
prefix: READ
---

# Reader

## Context and Design Philosophy

The reader renders a passage page by page with the learned set substituted. The learner should always be reading real text; substitution must never break copy, search or accessibility.

## Data

- `Passage { id, title, paragraphs[] }`
- `LearnedSet`: ordered list of letters (from `progression`)

## Rendering

Tokenize text into characters. Wrap each letter in the learned set in `<span class="g">` styled with the target font. Keep the original word available as an accessible label. Digits, punctuation and whitespace pass through unchanged.

## Peek

Revealing a glyph shows its Latin letter in a small popover for 1.5 s. Each peek is counted per letter and feeds the readiness hint in `progression`.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Glyph rendering | Font-styled spans over Latin text | Images per glyph; Unicode private-use codepoints | Keeps DOM text Latin for copy, search, screen readers; scales with text size |
| Case handling | Same glyph for upper and lower case | Distinct capitals | Most cipher fonts are unicase |

## Open Questions & Future Decisions

### Deferred
1. Peek gesture: long-press (400 ms) vs tap. Tap conflicts with page-edge taps (LAYOUT-007). Proposed: long-press.
2. Two fonts in one word can have mismatched x-heights and baselines. Proposed: add a spec to normalize with CSS `size-adjust` and `ascent-override`.
3. If the chosen font draws distinct capitals, detect at load and use them (affects READ-006).
