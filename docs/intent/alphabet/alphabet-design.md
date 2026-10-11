---
parent: high-level-design
prefix: ALPHA
---

# Alphabet

## Context and Design Philosophy

The alphabet node defines the letter mapping and loads the font that draws the glyphs. The Mandalorian script is a letter-for-letter cipher of the Latin alphabet with a single case, so the mapping is identity: the font itself draws each glyph, and upper and lower case share one shape. Mandalorian is the only alphabet in v1; the data model carries an alphabet id so a second one can be added later, but nothing is generalized ahead of that.

## Data

`Alphabet { id, name, fontUrl, letters: { a: "a", ... }, order[] }`

## Font

The app bundles **Mando AF Regular** (AurekFonts, CC0) as a WOFF2 file served from the app's own origin (`public/fonts/mando-af-regular.woff2`, about 18 KB). It draws all 26 letters with distinct glyphs in the style of *The Clone Wars* and *The Mandalorian*, and maps each capital to the same shape as its lowercase letter. Provenance, license and checksum live in `public/fonts/README.md`.

## Font Loading

At startup, register the bundled font with the FontFace API and wait for it to load before enabling substitution. Font status is `loading`, then `loaded` or `failed`. While the status is anything but `loaded`, all text renders in the reading font. A failed load shows a non-blocking message with a retry action. After first load the service worker serves the font from cache, so it loads offline (see `offline`).

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Mapping | Identity map plus cipher font | Unicode codepoint map | Mandalorian has no Unicode block |
| Scope | Mandalorian only, with an alphabet id in the data | Alphabet-agnostic engine from the start | Polish for one alphabet beats generality for none; the id keeps the door open at no cost |
| Font source | Bundle a public-domain font | Learner uploads a font file once | A CC0 font with distinct glyphs exists, so bundling removes the upload step for a young learner and the risk of iOS evicting an uploaded font from storage |
| Font choice | Mando AF Regular (v002) | Mando AF v001; Mando AF Classic; freeware fonts (Erik Stormtrooper "Mandalorian", Iconian "Mandalore") | v001 draws i/j and w/x identically, which makes those letters unlearnable; Classic follows the older *Attack of the Clones* style a fan of the show will not recognize; the freeware fonts are personal-use only and cannot be redistributed |

## Open Questions & Future Decisions

### Deferred
1. Non-identity maps (Greek, Cyrillic) are out of scope until a second alphabet is wanted.

## References

- `public/fonts/README.md` for the bundled font's provenance and license.
- AurekFonts font repository: https://github.com/AurekFonts/AurekFonts.github.io
