---
parent: high-level-design
prefix: ALPHA
---

# Alphabet

## Context and Design Philosophy

The alphabet node defines the letter mapping and loads the font that draws the glyphs. The Mandalorian script is a letter-for-letter cipher, so the mapping is identity: the font itself draws each glyph. Mandalorian is the only alphabet in v1; the data model carries an alphabet id so a second one can be added later, but nothing is generalized ahead of that.

## Data

`Alphabet { id, name, fontSource, letters: { a: "a", ... }, order[] }`

## Font Loading

Register the font via the FontFace API and verify it loads before enabling substitution. Browsers download web fonts from the site, so no installation is needed on iPhone or iPad.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Mapping | Identity map plus cipher font | Unicode codepoint map | Mandalorian has no Unicode block |
| Scope | Mandalorian only, with an alphabet id in the data | Alphabet-agnostic engine from the start | Polish for one alphabet beats generality for none; the id keeps the door open at no cost |

## Open Questions & Future Decisions

### Deferred
1. **Font source.** Bundle the font if its license allows web embedding (simplest; removes the eviction risk below). Otherwise the learner uploads it once and it stays on-device (ALPHA-001 to ALPHA-004 assume upload today).
2. iOS Safari can evict site storage after 7 days unused unless installed to the Home Screen, losing an uploaded font. If upload is kept, add a spec: when the font blob is missing, keep progress and prompt re-upload.
3. Non-identity maps (Greek, Cyrillic) are out of scope until a second alphabet is wanted.
