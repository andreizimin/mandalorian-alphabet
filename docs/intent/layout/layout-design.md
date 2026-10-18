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

The reader controls are: Next letter, Quiz, Step back, Reset, Legend, Library, text size, appearance and Feedback (owned by `feedback`).

- **Phones (< 600 px):** a single bottom bar holds the page-turn buttons at its two ends and, between them, Next letter, Quiz and a ⋯ menu button. The menu opens a sheet with Step back, Reset, Legend, Library, text size and appearance. Choosing Step back, Reset, Legend or Library closes the sheet, and so does tapping outside it; the text-size and appearance buttons leave it open so the result can be seen and stepped several times.
- **Wider screens (≥ 600 px):** a top bar shows every reader control; the bottom bar holds only the page-turn buttons.
- **Feedback:** an ordinary button styled like the others, never floating over the page. On wider screens it sits in the top bar; on phones, where there is no top bar and the bottom bar is full, a compact Feedback button sits at the right end of the passage-title line at the top of the screen.

The passage title sits above the page on every width. On the dev stage a small "DEV" marker follows the title, so a dev copy is never mistaken for the live app.

## Reading Column

Single column, line length capped at about 65 characters, so an iPad or laptop never shows ultra-wide lines. The page area fills the space between the top of the screen (or top bar) and the bottom bar, and pagination (owned by `content`) fills exactly that area.

## Text Size

Text size runs from 16 to 32 px in 2 px steps, default 20 px, changed with A− and A+ buttons. It applies to the reading font and the glyph font together. Changing it re-paginates the passage, keeping the learner on the word they were reading. Text size is the first entry in the settings slice saved by `persistence`.

## Appearance

The learner chooses the app's appearance: **Auto** (follow the device's light or dark setting), **Light** or **Dark**. The default is Auto, so a learner who never touches it gets what they had before the setting existed.

One button among the reader controls steps Auto → Light → Dark → Auto and shows the current choice as its label, so the result of a tap is visible at once; three values do not need a settings screen. The choice is the second entry in the settings slice saved by `persistence`.

Every color in the app comes from tokens on the document root (page, text, muted, accent, newest-letter highlight). Auto keeps today's behaviour: the dark tokens apply under the browser's dark-appearance media query. Light and Dark are applied as an attribute on the document root (`data-appearance`), which selects the tokens directly and sets `color-scheme` to match, so native controls and scrollbars follow the chosen appearance too. Auto removes the attribute.

Settings saved before this setting existed hold only a text size; they are read as Auto, so no learner sees the "saved progress could not be read" notice or loses their text size because a field is missing.

## Page Turning

Every way of turning a page maps to the same two actions, forward and back, which `content` executes:

- **Buttons:** ← and → at the two ends of the bottom bar, fixed to the bottom of the viewport (above the safe area) at every width. They never move with the length of the text. The back button is disabled on the first page.
- **Touch:** swipe left to go forward and swipe right to go back, following book direction. A swipe is a horizontal movement of at least 50 px that is larger than its vertical movement. A tap (movement under 10 px) on a non-glyph point in the outer 15 % of the viewport width turns the page: the right zone forward, the left zone back. A tap on a glyph anywhere is a peek (owned by `reader`); any other tap does nothing.
- **Keyboard:** Right Arrow turns forward and Left Arrow turns back. Keys are ignored while focus is in a text field and when Cmd, Ctrl or Alt is held.
- **While the feedback form is open** (see `feedback`), every page-turn input is paused, and events arriving from the feedback widget's host element never turn pages.

## Quiz Screen

The quiz is a separate full-screen view replacing the reader, opened in one tap from the reader controls on every width. Its 4 answer choices form a 2 by 2 grid: in the lower half of the viewport under 600 px so one thumb reaches all four, centered under the prompt at wider widths.

## Console Look

The app is one Mandalorian console, the one the intro terminal already is, so nothing in it reads as a stock web page. The look is a design language applied through shared tokens and classes; it changes no control's name, place or size, so every layout spec above holds as it did.

- **Panel and frame.** The reading column is a panel with a one-pixel amber frame, standing on a slightly darker page with a faint vignette. The panel carries a faint inner glow at its edges. The page-turn rail at the bottom is part of the same frame.
- **Palette.** Two palettes, chosen by the appearance setting: **night** (black panel, amber chrome, pale amber reading text, gold for the newest letter) and **day** (parchment panel, brown-amber chrome, dark brown reading text, brown for the newest letter). Auto follows the system as before. Every color is a token on the document root; text and the newest-letter highlight meet a contrast ratio of at least 4.5:1 against the panel in both palettes.
- **Keys.** Every button is a console key: the console monospace face, upper case with letter spacing, square corners, an amber edge, transparent face; the primary action (Next letter, Let's go, Again) is a filled amber key with a soft glow. Disabled keys dim. Keys keep their 44 pt minimum.
- **Status line.** The passage title is a status line in the console face: a `//` prefix, the title, the DEV tag as a console tag, and a blinking block cursor. On phones Feedback still sits at its right end.
- **Rails and panels.** The top bar is a rail with a rule beneath it; cards (new letter, end of passage), the phone menu sheet, the readiness hint, the legend, the library and the data panel are sub-panels of the same console: square corners, amber rules, console face for labels. The quiz's choices are large keys; right and wrong keep their green and red, tinted on the panel.
- **Reading text.** The passage keeps the serif reading font at the chosen text size, and the glyph font is untouched. A long story in a monospace face costs reading comfort, and reading fluency is the app's goal. The peek popover shows its word in the reading font on an amber chip.
- **Effects.** A subtle inner glow and vignette only. No scanlines or flicker: they soften the glyphs the learner is trying to recognize.
- **The intro terminal** uses the night palette's constants whatever the appearance, as the `intro` LLD says.

## Platform

Every interactive control is at least 44 by 44 pt. The layout respects safe areas (notch, home indicator) and, while the appearance is Auto, follows the system light or dark appearance; Light and Dark are the console's day and night palettes.

The newest-letter highlight is gold on the night panel and brown on the day panel, each with a contrast ratio of at least 4.5:1 against the panel, and distinct from the reading text's color.

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
| Appearance control | One button cycling Auto → Light → Dark, labelled with the current choice | A two-state Light/Dark toggle; a segmented control; a settings screen | A toggle loses Auto, which is the right default for most learners; three values fit one button whose label shows the result, and a settings screen is more than one setting needs |
| Applying the appearance | An attribute on the document root selecting the color tokens and `color-scheme` | A class on the app's root element; separate stylesheets | The tokens already live on the document root, and `color-scheme` must be set there for native controls to follow |
| The look | A Mandalorian console: framed panel, amber chrome, monospace keys, status line | The stock look (rounded grey buttons on a plain page); a themed skin on the stock look | The intro terminal sets a world and the reader behind it broke it; the primary user's motivation is the universe, so the app should feel like part of it rather than like a web page |
| Appearance under the console | Night and day palettes under Auto/Light/Dark | Always the night palette, removing the appearance setting | The requester had just asked for a light mode; a day console keeps it while the frame, keys and status line carry the look on parchment too |
| Reading font in the console | The serif reading font for the passage; monospace for the chrome | Monospace everywhere | Long reading in a monospace face is harder on the eyes, and the glyph font is unaffected either way |
| Effects | Subtle inner glow and vignette | None; full CRT scanlines and flicker | Scanlines soften the glyphs the learner is learning to recognize; a glow gives the panel depth without touching the text |
| Layout verification | Playwright with WebKit at three viewports | Checking CSS by eye; Chromium | Layout specs need a real engine; WebKit is the engine the primary user's devices run |
