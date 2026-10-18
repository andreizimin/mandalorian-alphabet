---
parent: high-level-design
prefix: INTRO
---

# Intro

## Context and Design Philosophy

The first thing a new learner sees sets the tone. The HLD wants the app to feel like part of the Star Wars universe rather than like schoolwork, so the first launch opens on an old Mandalorian terminal that types to the learner, not on a page of English with an instruction card over it. The terminal greets them in glyphs they cannot yet read, turns the greeting into English, admits they do not read Mando'a yet, and explains in a few lines how this app will teach them. One button, **Let's go**, starts the reading.

The intro is its own component: a one-time screen with its own text and animation. `progression` owns whether it has been completed (its first-launch flag) and still leaves the first letter to a tap on Next letter.

## Script

The terminal types, in order:

1. **The greeting**, `Hello, adventurer!`, with every letter drawn as a Mandalorian glyph. It uses the reader's renderer (`Substituted`) with the whole alphabet as the substitution set, so the glyphs are exactly the ones the learner will meet in the passages. It stands alone until the learner taps: as long as they like, since it is the first Mandalorian they ever see.
2. **Its English**, typed beneath it while the glyph line stays on screen, so the learner sees the two side by side and understands that the glyphs *were* English all along. This is the app's promise in one moment.
3. **The English lines**, typed one after another: that they do not read Mando'a yet and nobody does on their first day; that they will read real stories in which one letter at a time turns into Mandalorian; that Next letter takes the next letter, a tap on a glyph peeks at the word underneath, and the quiz checks what reading has taught; and that by the end they will read a whole page in Mandalorian. The words *Mando'a* and *Mandalorian* in these lines are drawn in glyphs, a sprinkle of the script through the message; they are guessable from their sentences, and they are the only words the learner needs no help with.

The text is data (`src/intro/typing.ts`), so tests check its content without timers, and the words can change without touching the component.

## Typing

The learner sets the pace, paragraph by paragraph. Within a paragraph (the glyph greeting, or one line), characters appear one at a time, about 28 ms apart, with a block cursor blinking at the typing position. When the paragraph is complete the terminal waits, showing a small "tap to continue" prompt, and nothing more happens until the learner taps. A tap while a paragraph is typing finishes that paragraph at once; a tap while waiting starts the next one. The schedule is a pure step function over a frame (how many characters of the greeting and of each line are shown) plus a tap function; the component drives the typing with a timer that is only armed while a paragraph is typing. This keeps the animation testable with fake timers and lets the whole script be shown at once by jumping to the final frame. A glyph word that is partly typed is drawn in glyphs as it grows, so it never flips from Latin to glyphs mid-word.

Two things change the pacing:

- **Reduced motion**: when the browser asks for it, the full text is shown at once with no animation and no taps.
- **The glyph font**: the greeting must not flash in a fallback font, so while the font is still loading the terminal shows only its cursor and typing begins once the font has loaded or failed. If it failed, the greeting is typed in the reading font (there is no glyph to show) and the English still explains the app.

When the last paragraph is complete, the Let's go button appears under the text.

## Appearance

The terminal is always dark, whatever appearance the learner has chosen for the reader (see `layout`): the console's night palette, a dark panel with the text in the warm accent color, a thin border and a blinking block cursor. An ancient terminal does not have a light mode. The rest of the app is drawn as the same console (`layout`, Console Look), so leaving the intro for the reader is a change of screen, not of world. The Let's go button sits outside the panel, on the page, so it is readable in both appearances.

The intro replaces the reader on screen, like the quiz does, and shows none of the reader chrome. It fits a phone without scrolling at the default text size; on wider screens it is a centered column.

## When It Shows

- **First launch:** `progression` reports that the learned set is empty and the intro has not been completed (PROG-014). The intro is shown instead of the reader. Let's go marks the intro completed and opens the reader on the opening passage.
- **Replay:** the library offers **Replay intro**. It shows the same terminal; Let's go returns to the passage the learner was reading, and nothing in progress changes.

Completion is stored by `progression` in its progress state under the field `welcomeSeen`, the name it had when the first-launch screen was a welcome card. The name is kept so saved progress and exports stay readable; its meaning is "the intro has been completed".

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Where the intro lives | Its own component under the HLD | Part of `progression`, which owned the welcome card | A screen with its own text and animation is a distinct intent; progression is about letter order and advancing, and only keeps the completion flag |
| Typing | A pure step function driven by a timer | CSS `steps()` animation over a clipped line; a typing library | Mixed glyph and Latin runs, pauses and the switch do not fit one CSS animation; a pure function is testable with fake timers and needs no dependency |
| Pacing | Paragraph by paragraph, each next one on a tap | Timed pauses between paragraphs; the whole text in one run; a Next button | A timer is either too fast to enjoy the glyphs or too slow for a learner who reads quickly; a tap lets each learner set the pace, and it is the same gesture that finishes a paragraph, so there is nothing new to learn and no button competing with Let's go |
| Tapping while typing | Finishes the current paragraph only | Finishes the whole text | Finishing everything on one tap would skip the paragraphs the learner wanted to read one at a time |
| The greeting's English | Typed on a line beneath, the glyph line staying, once the learner taps | Redrawing the glyph line in the reading font in place after under a second | Redrawing in place was over before the learner had looked at the glyphs, and took the first Mandalorian they saw away from them; side by side keeps both and still shows that glyphs are English |
| Glyphs in the message | *Mando'a* and *Mandalorian* drawn in glyphs | All English; random letters in glyphs; a decorative glyph line | Two guessable proper nouns keep the script on screen without costing the explanation; random glyphs would make the instructions unreadable, and a decorative line is noise, not language |
| Appearance | Always dark, accent text | Follow the reader's appearance | A terminal is dark by nature; a light terminal loses the "ancient Mandalorian" feel the request asked for |
| Replay | From the library | None; from the menu sheet | The library is where everything else that is not page-to-page lives, and a replay lets the intro be checked without clearing the device's data |
| Completion flag | `progression`'s existing `welcomeSeen` | A new field or an `intro` slice in persistence | A rename would make every saved progress unreadable (the validator requires the field) for no gain; a new slice is more machinery than one boolean needs |

## Verification

Unit tests with fake timers cover the schedule, the glyph-then-Latin greeting, the taps that finish a paragraph and bring the next, the wait for the font, reduced motion and the button. Browser tests in WebKit at three viewports cover the first open landing on the terminal, the greeting's glyphs being in the glyph font and then not, Let's go landing on the opening passage, a reload after that opening the reader, and the replay returning to the same passage. Every browser test's shared start helper goes through the intro, as does the live-site check.

## Open Questions & Future Decisions

### Deferred
1. A sound or a brief flicker when the terminal "boots" would add to the feel; left out until the text itself has been seen on a device.
