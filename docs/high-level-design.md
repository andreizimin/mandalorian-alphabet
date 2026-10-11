# High-Level Design: Script Ramp

## Problem

Flashcards teach glyph recognition but not reading fluency. A learner can name every glyph of a new script and still read it letter by letter, slowly, because they have never decoded it inside running text. The first target script is the Mandalorian alphabet, a letter-for-letter cipher of the Latin alphabet rendered by a font.

## Approach

Two modes share one learned set:

- **Reading (gradual substitution):** the learner reads real, comprehensible English text while letters are swapped one at a time for glyphs of the new script. Each new glyph is decoded from context hundreds of times before the next one arrives, so recognition is built inside the act of reading rather than beside it.
- **Quick quiz:** a short, separate multiple-choice session that checks what reading has taught: recognizing single letters, and matching short English words between their Mandalorian and Latin forms in both directions. The quiz verifies recognition; reading remains where it is built.

## Users

- **Primary:** a young Star Wars and Mandalorian fan, reading on iPhone (short sessions, one thumb) and iPad (longer sessions, portrait, landscape and Split View). Motivation comes from the universe, so the app should feel like part of it rather than like schoolwork.
- **Secondary:** family members sharing the same device.

## Goals

1. A learner reads a fully substituted passage at near-normal pace after about 2 hours of total practice.
2. One-thumb reading on iPhone; comfortable single-column reading on iPad in portrait, landscape and Split View.
3. Works offline after first load.
4. A polished Mandalorian reading experience end to end.

## Non-Goals (v1)

- Accounts, cloud sync, multi-device progress.
- Alphabets other than Mandalorian. The data model carries an alphabet id so a second alphabet can be added later, but v1 does not generalize ahead of one.
- Redistributing any third-party font whose license does not allow web embedding.
- Writing or typing practice, audio, non-Latin source text.

## Tenets

Ordered; when two conflict, the higher one wins.

- **Mandalorian polish over generality.** When a Mandalorian-specific choice is simpler or better than the general letter-for-letter design, take it; generalize when a second alphabet arrives.
- **Verification over uninterrupted flow.** When keeping the learner reading conflicts with confirming they actually know a glyph, confirm, even at the cost of breaking the passage.
- **Convenience over device purity.** Network requests, analytics and crash reporting are acceptable when they make the app easier to build or improve, as long as reading still works offline.

## System Design

The product is a client-only installable web app (PWA) with no backend; learner state lives on the device. It is hosted as static files at `learn-mandalorian.andreizimin.com`.

| Option | What it is | Cost | Verdict |
|---|---|---|---|
| A. Static SPA | One page, localStorage state | Lowest | Fails offline goal |
| B. Static PWA | A plus service worker, manifest, IndexedDB | Low | **Chosen** |
| C. SPA plus backend | B plus API for progress sync | Medium, ongoing ops | Out of scope for v1 |

B is chosen because offline reading on a phone is a core goal and it adds no server to operate.

**Stack:** Vite, React and TypeScript, tested with Vitest, Testing Library and jsdom. Each design-tree node is a directory under `src/` with the same name, so a spec prefix maps to one folder. React is chosen over a plain-DOM or Svelte build for ecosystem familiarity; the bundle-size cost is acceptable for a text app that is precached once.

### Design Tree

| Node | Prefix | Owns |
|---|---|---|
| [reader](intent/reader/reader-design.md) | READ | Rendering passages with substitution, peek |
| [progression](intent/progression/progression-design.md) | PROG | Letter order, advancing, readiness hint |
| [alphabet](intent/alphabet/alphabet-design.md) | ALPHA | Letter mapping, font loading |
| [quiz](intent/quiz/quiz-design.md) | QUIZ | Quick multiple-choice quiz on letters and short words |
| [content](intent/content/content-design.md) | TEXT | Bundled and pasted passages, pagination |
| [persistence](intent/persistence/persistence-design.md) | PERS | On-device state, export and import |
| [layout](intent/layout/layout-design.md) | LAYOUT | Responsive layout for iPhone and iPad |
| [offline](intent/offline/offline-design.md) | OFF | Service worker, installability |

## Key Decisions

- **Rendering:** each letter in the learned set renders as a span styled with the target font; all other characters render in the reading font. Underlying text stays Latin, so copy, search and screen readers keep working. Browsers load the font as a standard web font; nothing is installed on the device.
- **Letter order:** fixed English letter frequency (E, T, A, O, I, N...), so new glyphs get maximum exposure. The learner does not reorder letters.
- **Progression control:** the learner advances; the app suggests readiness but never forces it. Readiness draws on two signals: few peeks on the newest letter while reading, and quick-quiz results on that letter. Gating advancement on a passed quiz was rejected because a stuck learner would lose control of their own pace.
- **Quiz is optional and separate:** the quiz is its own screen, never injected into a passage. It feeds the readiness hint and nothing else; it does not change the learned set.
- **Font source:** the app bundles Mando AF Regular, a public-domain (CC0) font that draws the Mandalorian alphabet as seen in *The Clone Wars* and *The Mandalorian*. Nothing to upload or install. See `alphabet` LLD.
- **One case:** the Mandalorian script has no upper and lower case, so both cases of a letter draw the same glyph. The underlying text keeps its original case for copy, search and screen readers.

## Open Questions

1. Analytics with a young primary user: the convenience tenet allows it, but the app should carry a short privacy note and a setting to turn analytics off. Decide whether this becomes its own `analytics` node or a setting under `persistence` when analytics is first added.

## Success Metrics

- **Time to full substitution:** a learner who reads regularly reaches all 26 letters within about 2 hours of cumulative reading time.
- **Fluency:** at full substitution, reading pace is near the learner's own pace on an unsubstituted page of the same passage.
- **Context is teaching:** peeks on a newly introduced letter fall steadily over the pages that follow it.
- **Recognition holds:** quick-quiz accuracy on letters learned more than a few sessions ago stays high, in both directions.
- **Offline:** with the network off after first load, the app launches and a passage can be read and advanced.

Falsification signals: learners stall before about 10 letters; peek rates for a letter stay flat after its introduction; reading pace at full substitution stays well below the unsubstituted baseline.

## References

- Diglot weave: the language-teaching technique of progressively substituting target-language elements into native-language text, which this app applies at the script level.
- Mando AF font by AurekFonts (CC0): https://github.com/AurekFonts/AurekFonts.github.io; provenance in `public/fonts/README.md`.
- WebKit storage policy: Safari may evict script-writable storage for sites not used within 7 days unless the site is installed to the Home Screen; see the `offline` LLD.

## Glossary

- **Learned set:** the ordered list of letters currently rendered as glyphs.
- **Peek:** revealing the Latin letter behind a glyph.
- **Quick quiz:** a short multiple-choice session on letters and short words, separate from reading.
- **Reading font:** the normal font used for non-substituted characters.
