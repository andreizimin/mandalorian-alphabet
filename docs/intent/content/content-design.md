---
parent: high-level-design
prefix: TEXT
---

# Content

## Context and Design Philosophy

Content supplies what to read and turns it into pages. Passages must be long enough that each new glyph appears many times before the next one arrives, and engaging enough that a young reader keeps turning pages. Franchise text cannot be bundled, so the bundled passages are public-domain adventure and science fiction, the closest match in tone; pasting covers anything else the learner wants to read.

## Bundled Passages

| Order | Passage | Words | Reading grade | Why |
|---|---|---|---|---|
| 1 | *The Call of the Wild*, ch. 1 "Into the Primitive" (Jack London, 1903) | ~3,800 | ~8 | A lone survivor learning a brutal new world's law; opens fast; strongest rare-letter coverage |
| 2 | *Treasure Island*, ch. 1–2 (R. L. Stevenson, 1883) | ~4,500 | ~8 | A young narrator, a menacing outlaw, a sea-chest; the closest public-domain match to a bounty-hunter story |
| 3 | *The War of the Worlds*, ch. 1–2 (H. G. Wells, 1898) | ~3,600 | ~10 | Aliens arrive; the science-fiction pick, harder prose for later in the ramp |

All three are public domain and come from Project Gutenberg with its header, footer and trademark stripped. Each excerpt starts at a chapter opening and ends at a chapter end. Hard line wraps are joined into paragraphs and typographic quotes are kept. Each passage contains every letter a–z several times, so no glyph lacks exposure. The conversion is a script checked into `scripts/`, so a passage can be regenerated and its provenance checked.

## Passage Model

`Passage { id, title, source: 'bundled' | 'pasted', paragraphs[] }`

`Position { paragraph, word }` names a word by its paragraph index and its word index within that paragraph. A position never refers to a page, so it survives re-pagination.

## Pasted Passages

- **Paragraphs:** if the text contains blank lines, paragraphs split on them and single line breaks inside a paragraph become spaces (hard-wrapped text); otherwise each line is a paragraph. Runs of whitespace collapse to one space; empty paragraphs are dropped.
- **Title:** the first six words of the first paragraph, followed by an ellipsis when the paragraph is longer.
- **Limits:** a paste with no letter a–z cannot be saved; a paste over 100,000 characters is refused with a message giving the limit.
- **Storage:** pasted passages are part of the content slice in on-device storage (see `persistence`).
- **Deleting:** a pasted passage can be deleted from the library after confirmation; bundled passages cannot. Deleting the passage being read opens the first bundled passage.

## Library and First Launch

The library lists every bundled passage, then every pasted passage newest first, and holds the paste action. It opens in one tap from the reader controls; choosing a passage opens it at the learner's last position in it, or at its start. On first launch the app opens straight into the first bundled passage, so the learner is reading within seconds.

## Pagination

A page is the run of words from a start position to an end position that fits the reading area. Pagination is greedy: whole paragraphs are added while they fit; a paragraph that does not fit is split at the last word that fits; a single word too large for an empty page is placed alone so pagination always advances. Whether content fits is decided by a measuring function supplied by the caller, which in the browser renders the candidate page into a hidden element styled like the reading area.

Re-pagination happens when the viewport size or text size changes. The learner stays on the page that contains their current position (the first word of the page they were on).

## Page Turns and Reading Progress

- **Forward** moves to the next page and makes its first word the current position.
- **Back** moves to the previous page.
- **Pages read:** a forward turn counts as a page read for `progression` only when the page being left extends past the furthest position the learner has reached in this passage. Re-reading pages after turning back does not inflate the reading signal.
- **End of passage:** a forward turn on the last page counts that page as read and shows an end card naming the passage, with "Next passage" (the next bundled passage in order, wrapping to the first) and "Library".

Gestures for turning pages belong to `layout`; content exposes forward and back.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Paging | Paginated pages | Continuous scroll | Page turns give a natural unit for progress and one-thumb reading |
| First launch | Open the first bundled passage | Open the library; show an onboarding flow | Reading is the product; a list or a tour delays the first page. The welcome card (owned by `progression`) explains advance in place |
| Bundled tone | Public-domain adventure and science fiction | Classic literary prose; franchise text | Keeps a young reader reading; franchise text cannot be redistributed, and pasting covers it |
| Bundled picks | *Call of the Wild*, *Treasure Island*, *War of the Worlds* | *A Princess of Mars*; *The Lost World* | *Princess of Mars* reads at grade 13 or above; *The Lost World* opens with a drawing-room romance and reaches the adventure only in later chapters |
| Position | Paragraph and word index | Page number; character offset | Page numbers break on rotation and text-size change; a word index survives them and cannot land mid-word |
| Counting pages read | Only forward turns past the furthest point reached | Every forward turn | Flicking back and forth would fire the reading hint without any new reading |
| Measuring fit | Caller-supplied measuring function | Estimating characters per page | Glyph and reading-font widths differ and change as letters are learned; only real layout is reliable. Injecting the measure also keeps pagination testable |
| Pasted passage storage | Content slice in localStorage | IndexedDB | Synchronous like every other slice; a learner's pasted texts are far below the roughly 5 MB localStorage budget with the 100,000-character cap |

## Open Questions & Future Decisions

### Deferred
1. Pasted text with accented letters (é, ü) leaves those Latin while plain e is substituted. Accepted for v1.
2. Re-pagination when letters are learned: glyphs are narrower than most reading-font letters, so pages may hold slightly more text as substitution grows. Pages are recomputed on the same triggers as a viewport change; whether to also recompute on advance is left to implementation, since the position rule keeps the learner in place either way.
