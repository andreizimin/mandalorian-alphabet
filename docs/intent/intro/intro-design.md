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

1. **The greeting**, `Hello, adventurer!`, with every letter drawn as a Mandalorian glyph. It uses the reader's renderer (`Substituted`) with the whole alphabet as the substitution set, so the glyphs are exactly the ones the learner will meet in the passages.
2. **The switch**: after a pause, the same line is redrawn in the reading font, so the learner sees that the glyphs *were* English all along. This is the app's promise in one moment.
3. **The English lines**, typed one after another: that they do not read Mando'a yet and nobody does on their first day; that they will read real stories in which one letter at a time turns into Mandalorian; that Next letter takes the next letter, a tap on a glyph peeks at the word underneath, and the quiz checks what reading has taught; and that by the end they will read a whole page in Mandalorian.

The text is data (`src/intro/typing.ts`), so tests check its content without timers, and the words can change without touching the component.

## Typing

Characters appear one at a time, about 28 ms apart, with longer pauses after the greeting, after the switch and at the end of each line. A block cursor blinks at the typing position. The schedule is a pure step function over a frame (how many characters of each part are shown, and whether the greeting is still in glyphs); the component drives it with a timer. This keeps the animation testable with fake timers and lets the whole script be shown at once by jumping to the final frame.

Three things shortcut the typing:

- **A tap anywhere on the terminal** while it is typing finishes the text at once. A learner who has seen it before, or a tester, does not wait.
- **Reduced motion**: when the browser asks for it, the full text is shown at once with no animation.
- **The glyph font**: the greeting must not flash in a fallback font, so while the font is still loading the terminal shows only its cursor and typing begins once the font has loaded or failed. If it failed, the greeting is typed in the reading font (there is no glyph to show) and the English still explains the app.

When the typing is complete, the Let's go button appears under the text.

## Appearance

The terminal is always dark, whatever appearance the learner has chosen for the reader (see `layout`): a dark panel with the text in the warm accent color, a thin border and a blinking block cursor. An ancient terminal does not have a light mode. The Let's go button is styled so it is readable on the dark panel in both appearances.

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
| Skipping | A tap anywhere finishes the text | A Skip button; no skip | A tap is what a learner tries first, and avoids a second button competing with Let's go |
| The switch | The glyph greeting is redrawn in the reading font in place | Typing the English greeting on a second line | Redrawing the same line shows that glyphs are English, the whole idea of the app, in one move |
| Appearance | Always dark, accent text | Follow the reader's appearance | A terminal is dark by nature; a light terminal loses the "ancient Mandalorian" feel the request asked for |
| Replay | From the library | None; from the menu sheet | The library is where everything else that is not page-to-page lives, and a replay lets the intro be checked without clearing the device's data |
| Completion flag | `progression`'s existing `welcomeSeen` | A new field or an `intro` slice in persistence | A rename would make every saved progress unreadable (the validator requires the field) for no gain; a new slice is more machinery than one boolean needs |

## Verification

Unit tests with fake timers cover the schedule, the glyph-then-Latin greeting, the tap that finishes typing, the wait for the font, reduced motion and the button. Browser tests in WebKit at three viewports cover the first open landing on the terminal, the greeting's glyphs being in the glyph font and then not, Let's go landing on the opening passage, a reload after that opening the reader, and the replay returning to the same passage. Every browser test's shared start helper goes through the intro, as does the live-site check.

## Open Questions & Future Decisions

### Deferred
1. A sound or a brief flicker when the terminal "boots" would add to the feel; left out until the text itself has been seen on a device.
