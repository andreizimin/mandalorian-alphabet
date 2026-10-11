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

Tokenize text into characters. Wrap each letter in the substitution set in `<span class="g">` styled with the target font. Keep the original word available as an accessible label. Digits, punctuation and whitespace pass through unchanged.

The renderer takes the substitution set as an explicit parameter. The reader passes the learned set; the `quiz` passes the letters of the item it is showing, which may include letters not yet learned.

## Peek

Tapping a glyph shows its Latin letter in a small popover for 1.5 s. A tap on a glyph is always a peek, even inside the page-edge zones that `layout` uses for page turns; the glyph target wins. Each peek is counted per letter and feeds the readiness hint in `progression`.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Glyph rendering | Font-styled spans over Latin text | Images per glyph; Unicode private-use codepoints | Keeps DOM text Latin for copy, search, screen readers; scales with text size |
| Case handling | Same glyph for upper and lower case | Distinct capitals | Most cipher fonts are unicase |
| Peek gesture | Tap on the glyph | Long-press (400 ms) | Long-press on iOS triggers text selection and the callout menu; suppressing them would break the copy and selection promise. Tap conflicts with page-edge taps only on glyphs in the edge zone, which the glyph-wins rule settles |
| Substitution set | Explicit parameter | Renderer reads the learned set itself | The quiz renders letters outside the learned set; one renderer with a parameter keeps passage and quiz glyphs identical |

## Open Questions & Future Decisions

### Resolved
1. ✅ Peek is a tap; glyph taps take precedence over page-edge taps. See Decisions.

### Deferred
1. Two fonts in one word can have mismatched x-heights and baselines. Proposed: add a spec to normalize with CSS `size-adjust` and `ascent-override`.
2. If the chosen font draws distinct capitals, detect at load and use them (affects READ-006).
