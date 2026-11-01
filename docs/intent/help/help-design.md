---
parent: high-level-design
prefix: HELP
---

# Help

## Context and Design Philosophy

The intro explains the app once, on the first launch, and covers only the core of it: reading, Next letter, peeking and the quiz. A learner who skipped through it, a family member picking up the device, or anyone who forgot what a control does needs an answer they can reach from the page they are reading and leave just as fast. Help is that answer: one key among the reader controls opens a short panel that says what the app does and what every control and gesture does. One tap closes it, and the learner is back on the same page.

Help is its own component because it is a screen of its own with its own text. `layout` owns where its key sits; the text and the panel live here.

## Content

The panel opens with what the app is and how it teaches, in two or three lines: the learner reads real stories in English, one letter at a time turns into its Mandalorian glyph, and the glyph is learned from the words around it until a whole page is in Mandalorian. Below that is one short line per control or gesture, in the order a learner meets them:

- **Next letter:** turns the next letter into a glyph; take it when the current one feels easy, and a hint says when you look ready.
- **Tap a glyph:** peeks at its word in English. **Highlight text:** shows the English of the whole selection.
- **← →, a swipe, or a tap on the page's edge:** turns the page.
- **Quiz:** a quick 10-question check of the letters learned so far, from 2 letters.
- **Legend:** the letters learned so far.
- **Step back:** removes the newest letter if it came too soon. **Reset:** starts again from no letters.
- **Library:** another story, your own pasted text, and exporting or importing progress.
- **A− A+ and the appearance key:** text size; Auto, Light or Dark.
- **Feedback and Suggest a feature:** tell us what is wrong or what you would like.

A note, shown only under 600 px wide, says that on a phone the ⋯ key holds the controls that are not in the bottom bar; everything else reads the same at every width.

The text is data (`src/help/helpText.ts`), like the intro's script, so a test can check that every reader control is named and the words can change without touching the component. The quiz line takes its numbers (questions in a session, letters the quiz needs) from the quiz's own values, so it cannot drift from them.

## The Panel

The panel is a console sub-panel (see `layout`, Console Look) in the shared overlay, over the page: a modal dialog labelled "Help", with the keys **Replay intro** and **Close**.

- **Closing:** Close, a tap on the backdrop outside the panel, or Escape. The backdrop covers the whole page, so the closing tap reaches nothing beneath it: no control, glyph or edge zone. Closing shows the same place in the passage the learner left. The reader keeps its place as a position in the text, not a page number, so a resize or a font change while the panel is open re-cuts the pages around that place.
- **Replay intro:** closes the panel and shows the intro terminal, exactly as Replay intro in the library does (`intro`, INTRO-008). Let's go returns to the same place in the passage, with the panel closed.
- **Page turns:** while the panel is open, every page-turn input is paused: keys, swipes, edge taps, and the on-screen ← → buttons, which lie under the backdrop. The menu sheet and the feedback form pause page turns the same way.
- **Small screens:** the panel's text is longer than a phone in landscape is tall. So the panel is capped at the viewport's height and scrolls within itself; Close is pinned in the panel's header at every scroll position, and the page behind stays put.
- **Focus and assistive technology:** opening the panel moves keyboard focus to Close; closing it returns focus to the Help key that opened it. While it is open, the reader behind it is inert, so Tab and a screen reader stay inside the panel. After Replay intro, focus is not returned, because the Help key is no longer on screen.

Help opens from the reader only. The quiz, the library and the intro each have their own way back to reading. Help never opens while another overlay is open: the new-letter card, the end-of-passage card, the phone menu sheet or the feedback form. Most of these already cover the Help key; the reader also ignores the Help action while any of them is open, so two overlays never stack.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| What Help shows | A panel: what the app is, one line per control, Replay intro and Close | Replay the intro terminal; the panel without Replay intro | The intro is slow to sit through for a quick question and names only four controls; a panel is quick to scan and covers them all, and replay stays one tap away for anyone who wants the story again |
| Where it lives | Its own component | Part of `intro`; part of `layout` | A panel with its own text is a distinct intent; `layout` owns only the key's place, as it does for Feedback |
| Close key position | At the top of the panel | At the bottom, after the text | On a short phone screen the bottom of a scrolled panel is out of reach until the learner scrolls; at the top it is always one tap away |
| The text | Data in `helpText.ts`, checked against the control names | Written inline in the component | A renamed or new control fails the test until Help says what it does, so Help cannot drift from the controls unnoticed |
| Focus and modality | Focus to Close on open and back to the opener on close; the reader behind is inert | Leave focus where it was; a full focus-trap library | Without it, a keyboard or VoiceOver user can tab or swipe into the page behind the panel; `inert` and `aria-modal` give the trap with no dependency |
| A tap outside | Closes the panel and is consumed | Closes the panel and also acts on what it hit | A tap meant to dismiss must not also turn a page, peek or press a control the learner could not see clearly behind the backdrop |
| Analytics | No event | A `mando_help_open` event | The `analytics` LLD counts core-loop actions, not controls |

## Verification

Unit tests cover the text (the explanation and every reader control named), the panel's closing by Close, backdrop and Escape, and Replay intro. Browser tests in WebKit at three viewports cover the Help key's place and size, opening over the page, closing to the same page, page turns ignored while it is open, the replay returning to the same passage, and the panel scrolling within itself at the phone viewport with Close reachable.
