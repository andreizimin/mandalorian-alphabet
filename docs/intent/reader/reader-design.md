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

The renderer also takes an optional highlight letter. Its glyphs, in upper and lower case, get an extra class drawn in the newest-letter highlight color (defined by `layout`). The passage page passes the newest learned letter, so the letter currently being learned is easy to spot on every page; the highlight moves when the learned set changes. The highlight changes color only, never size, weight or spacing, so pagination (owned by `content`), which measures glyph widths, is unaffected.

## Peek

Tapping a glyph shows the whole word it belongs to in English: a small popover directly under the word, with the word in the reading font and every occurrence of the tapped letter marked (underlined and bold, so the mark does not depend on color). The learner checks a reading where their eye already is, with no control to find. The popover stays 1.5 s; tapping another glyph replaces it.

The popover is positioned relative to the viewport, so the page area's clipping never cuts it off. It is centered under the word and kept within the viewport's width; when there is no room below the word within the page area (the last line), it sits above the word. Its size is known only once it renders, so it is placed in a layout effect before the frame is shown.

A tap on a glyph is always a peek, even inside the page-edge zones that `layout` uses for page turns; the glyph target wins. Each peek is counted for the tapped letter and feeds the readiness hint in `progression`; showing the word adds no cost. The word is the whitespace-delimited token the renderer wraps, punctuation included, so the learner sees exactly what the glyphs stand for.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Glyph rendering | Font-styled spans over Latin text | Images per glyph; Unicode private-use codepoints | Keeps DOM text Latin for copy, search, screen readers; scales with text size |
| Case handling | Same glyph for upper and lower case; DOM keeps original case | Distinct capitals; a marker for capitalized words | The Mandalorian script has one case; punctuation and spacing still mark sentences, so a capital cue is not worth an invented mark |
| Peek gesture | Tap on the glyph | Long-press (400 ms) | Long-press on iOS triggers text selection and the callout menu; suppressing them would break the copy and selection promise. Tap conflicts with page-edge taps only on glyphs in the edge zone, which the glyph-wins rule settles |
| Newest-letter highlight | Accent color on the newest letter's glyphs, always on until the learned set changes | Color plus underline; tinted background; bold or larger glyphs; highlight only for the first pages | Color alone keeps a page of frequent letters calm; bold or larger glyphs would change text width and break pagination; a highlight that fades would hide the newest letter exactly when the learner looks for it |
| Substitution set | Explicit parameter | Renderer reads the learned set itself | The quiz renders letters outside the learned set; one renderer with a parameter keeps passage and quiz glyphs identical |
| What a peek shows | The whole word, in a popover under the word | A single letter fixed at the bottom of the screen; a held X-ray button turning the whole page English; a long-press on the text for the page; a lens following the finger | A learner checking a reading wants the word, where they are looking, not a letter at the bottom; a page-wide reveal needs a control to find or a long-press, and long-press collides with iOS text selection; a lens cannot line up Latin and glyph widths |
| Marking the tapped letter | Every occurrence of the letter in the word, underlined and bold | Only the tapped glyph; color alone | Repeated letters make the tapped one ambiguous, and all of them read as the same glyph; underline and weight survive both appearances and color blindness |

## Open Questions & Future Decisions

### Resolved
1. ✅ Peek is a tap; glyph taps take precedence over page-edge taps. See Decisions.

### Deferred
1. Two fonts in one word can have mismatched x-heights and baselines. Mando AF glyphs are full-height strokes, so mixed words will look uneven next to lowercase Latin letters. Proposed: add a spec to normalize with CSS `size-adjust` and `ascent-override` once the reading font is chosen.
