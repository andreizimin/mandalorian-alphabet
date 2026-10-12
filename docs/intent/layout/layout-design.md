---
parent: high-level-design
prefix: LAYOUT
---

# Layout

## Context and Design Philosophy

One codebase serves iPhone, iPad and a laptop. Layout responds to viewport width, not device type, so iPad Split View and Slide Over behave correctly. The reading page gets as much of the screen as possible; on a phone, the actions used every few pages stay in thumb reach and the rest wait one tap away.

## Breakpoints

| Width | Typical device | Controls |
|---|---|---|
| < 600 px | iPhone, narrow Split View | Bottom bar: ← · Next letter · Quiz · ⋯ · →; the ⋯ menu holds the rest; Feedback at the right end of the title line |
| ≥ 600 px | iPad, laptop | Top bar with every reader control; bottom bar holds ← and → |

## Reader Controls

The reader controls are: Next letter, Quiz, Step back, Reset, Legend, Library, text size and Feedback (owned by `feedback`).

- **Phones (< 600 px):** a single bottom bar holds the page-turn buttons at its two ends and, between them, Next letter, Quiz and a ⋯ menu button. The menu opens a sheet with Step back, Reset, Legend, Library and text size. Choosing Step back, Reset, Legend or Library closes the sheet, and so does tapping outside it; the text-size buttons leave it open so the size can be stepped several times.
- **Wider screens (≥ 600 px):** a top bar shows every reader control; the bottom bar holds only the page-turn buttons.
- **Feedback:** an ordinary button styled like the others, never floating over the page. On wider screens it sits in the top bar; on phones, where there is no top bar and the bottom bar is full, a compact Feedback button sits at the right end of the passage-title line at the top of the screen.

The passage title sits above the page on every width. On the dev stage a small "DEV" marker follows the title, so a dev copy is never mistaken for the live app.

## Reading Column

Single column, line length capped at about 65 characters, so an iPad or laptop never shows ultra-wide lines. The page area fills the space between the top of the screen (or top bar) and the bottom bar, and pagination (owned by `content`) fills exactly that area.

## Text Size

Text size runs from 16 to 32 px in 2 px steps, default 20 px, changed with A− and A+ buttons. It applies to the reading font and the glyph font together. Changing it re-paginates the passage, keeping the learner on the word they were reading. Text size is the first entry in the settings slice saved by `persistence`.

## Page Turning

Every way of turning a page maps to the same two actions, forward and back, which `content` executes:

- **Buttons:** ← and → at the two ends of the bottom bar, fixed to the bottom of the viewport (above the safe area) at every width. They never move with the length of the text. The back button is disabled on the first page.
- **Touch:** swipe left to go forward and swipe right to go back, following book direction. A swipe is a horizontal movement of at least 50 px that is larger than its vertical movement. A tap (movement under 10 px) on a non-glyph point in the outer 15 % of the viewport width turns the page: the right zone forward, the left zone back. A tap on a glyph anywhere is a peek (owned by `reader`); any other tap does nothing.
- **Keyboard:** Right Arrow turns forward and Left Arrow turns back. Keys are ignored while focus is in a text field and when Cmd, Ctrl or Alt is held.
- **While the feedback form is open** (see `feedback`), every page-turn input is paused, and events arriving from the feedback widget's host element never turn pages.

## Quiz Screen

The quiz is a separate full-screen view replacing the reader, opened in one tap from the reader controls on every width. Its 4 answer choices form a 2 by 2 grid: in the lower half of the viewport under 600 px so one thumb reaches all four, centered under the prompt at wider widths.

## Platform

Every interactive control is at least 44 by 44 pt. The layout respects safe areas (notch, home indicator) and follows the system light or dark appearance.

The newest-letter highlight color is the app's warm accent: brown on the light page and gold in dark appearance, each with a contrast ratio of at least 4.5:1 against the page background.

## Verification

Width-dependent placement, sizes and real pagination depend on the browser's layout engine, which the unit-test environment does not have. These are verified by browser tests (Playwright) running WebKit, the engine behind iPhone and iPad Safari, at an iPhone, an iPad and a laptop viewport.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Breakpoints | By width | By user agent | Handles Split View and future devices |
| iPad layout | Single column | Two columns in landscape | Simpler pagination; comfortable line length |
| Phone controls | Bottom bar with ←, Next letter, Quiz, ⋯, →; the rest in a menu | Arrows and a menu only; two bottom rows with everything | Next letter and Quiz are the actions used between pages and belong in thumb reach; Step back, Reset, Legend, Library and text size are occasional and fit one tap away; two rows cost a phone too much reading space |
| Page-turn buttons | At the ends of a bar fixed to the bottom of the viewport | Button after the text; floating arrows at mid-height | A button after the text moves with every page's length; a bottom bar stays put and is in thumb reach on a phone |
| Keyboard turns | Left and Right Arrow, ignored in text fields and with modifier keys | Space and Page Down as well | Arrows match the book direction of swipes; Space would also scroll and collide with typing |
| Edge-zone width | Outer 15 % of viewport width | Fixed 44 pt strips | A proportional zone stays reachable on iPad and leaves most of a phone page for peeks |
| Swipe threshold | 50 px horizontal and more horizontal than vertical | Any horizontal movement | Small finger drift during a glyph tap must not turn the page |
| Text size control | A− and A+ in 2 px steps | A slider | Two buttons are reliable to hit with a thumb and give predictable steps |
| Layout verification | Playwright with WebKit at three viewports | Checking CSS by eye; Chromium | Layout specs need a real engine; WebKit is the engine the primary user's devices run |
