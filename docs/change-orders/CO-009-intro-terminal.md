# CO-009: Intro terminal

| | |
|---|---|
| Type | Feature |
| Status | Done |
| Requested | 2026-10-16 |
| Approved | 2026-10-17 |
| Completed | 2026-10-17 |
| Ticket | [ZZF-69](https://linear.app/zizify-workshop/issue/ZZF-69) |

## Request

"Needs to have an intro page - like an ancient Star Wars Mandalorian terminal that displays information like it's typing it out - first in all glyphs - saying "Hello, adventurer!" And then switching to English, acknowledging that you don't yet know the Mando'A and explaining how to learn it, with a "let's go" button"

## Intent

The first thing a new learner sees is a Mandalorian terminal, not a page of English with a card over it. It types "Hello, adventurer!" in glyphs, then the same line turns into English, then it explains in a few typed lines that they do not read Mando'a yet and how this app will teach them, and ends on a **Let's go** button that opens the first passage. It replaces the welcome card. It shows once, and can be replayed from the library.

## Predicted Impact

### HLD

- **Design Tree:** a new row, `intro` (prefix `INTRO`): the first-launch terminal. The intro is its own intent (a one-time screen with its own text and animation) rather than part of progression, which owns letter order and advancing.
- **Users:** unchanged; the intro is the first place the "feel like part of the universe" goal shows.

### LLDs

| Component | Section | Change |
|---|---|---|
| `intro` | New LLD | The terminal: full screen in place of the reader; typing character by character; the glyph greeting (every letter drawn as a glyph, using the reader's renderer with the whole alphabet as its set) then redrawn in the reading font; the English text and what it must cover; a tap finishes the typing at once; reduced motion shows everything at once; waits for the glyph font; the Let's go button; replay from the library; always drawn dark with the accent color, whatever the appearance (CO-007) |
| `progression` | First Launch | The welcome card is retired; the intro (owned by `intro`) is shown instead when the learned set is empty and the intro has not been completed. The stored flag keeps its name `welcomeSeen` so saved progress stays readable; it now means "intro completed" |
| `progression` | Data | `welcomeSeen` described as above; the event is `completeIntro` |
| `progression` | Decisions & Alternatives | "First letter" row: the welcome card is replaced by the intro, which still leaves the first letter to a tap |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `INTRO-001` | Add | While the intro is shown, the system SHALL present it as a full-screen terminal in place of the reader, typing its text out character by character. |
| `INTRO-002` | Add | When the intro starts typing, the system SHALL first type "Hello, adventurer!" with every letter drawn as a Mandalorian glyph, then redraw that line in the reading font. |
| `INTRO-003` | Add | After the greeting is redrawn in English, the system SHALL type, in English, that the learner does not read Mando'a yet and how they will learn it: reading real stories in which one letter at a time becomes Mandalorian, Next letter to take the next one, a tap on a glyph to peek, and the quiz to check. |
| `INTRO-004` | Add | When the typing is complete, the system SHALL show a Let's go button; when the learner taps it, the system SHALL mark the intro completed and open the reader on the opening passage. |
| `INTRO-005` | Add | When the learner taps the terminal while it is still typing, the system SHALL show the rest of the text at once. |
| `INTRO-006` | Add | When the intro starts before the glyph font has loaded or failed, the system SHALL show the terminal with its cursor and begin typing once the font has loaded or failed. |
| `INTRO-007` | Add | While the browser asks for reduced motion, the system SHALL show the intro's text at once instead of typing it. |
| `INTRO-008` | Add | The system SHALL offer Replay intro in the library; it SHALL show the intro again without changing progress, and Let's go SHALL return to the passage the learner was reading. |
| `PROG-014` | Revise | When the app is launched with an empty learned set and the intro has not been completed, the system SHALL show the intro (INTRO-001) in place of the reader; no letter is introduced until the learner taps Next letter. |

Net: +8 new, ~1 revised, 0 deleted. If decision 1 is "no", INTRO-008 is dropped (+7).

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/intro/typing.test.ts` | Add | `INTRO-001`, `INTRO-002`, `INTRO-003` (the typing schedule: greeting in glyphs, the switch, the English lines, the text's required content) |
| `src/intro/IntroTerminal.test.tsx` | Add | `INTRO-001`, `INTRO-002`, `INTRO-004`, `INTRO-005`, `INTRO-006`, `INTRO-007` (with fake timers: glyphs then Latin; the button appears when typing ends; a tap finishes; waits for the font; reduced motion) |
| `src/progression/progression.test.ts` | Change | `PROG-014` (`showIntro`, `completeIntro`) |
| `src/progression/components.test.tsx` | Change | WelcomeCard tests removed |
| `e2e/helpers.ts` | Change | `start()` goes through the intro: a tap to finish typing, then Let's go |
| `e2e/live.spec.ts` | Change | The two tests that open the app go through the intro before looking for the passage title |
| `e2e/intro.spec.ts` | Add | `INTRO-001`, `INTRO-002`, `INTRO-004`, `INTRO-005`, `INTRO-008`, `PROG-014` (first open shows the terminal and no page; the greeting's glyphs are in the glyph font and then are not; Let's go lands on the opening passage; a reload after that opens the reader; replay from the library returns to the same passage) |

### Code

| File | Action | What changes |
|---|---|---|
| `src/intro/typing.ts` | Add | The script (greeting, English lines) and the typing schedule as data, so tests check the text without timers |
| `src/intro/IntroTerminal.tsx` | Add | The terminal component: typing with a timer, tap to finish, reduced motion, font wait, Let's go |
| `src/App.tsx` | Change | An `intro` view shown on first launch and on replay; Replay intro in the library view; `completeIntro` on Let's go |
| `src/progression/progression.ts` | Change | `showWelcome` becomes `showIntro`; the event `dismissWelcome` becomes `completeIntro`; the stored field keeps its name |
| `src/progression/components.tsx` | Change | `WelcomeCard` removed |
| `src/app.css` | Change | Terminal styles: dark panel, accent text, cursor, typing layout |

### Other

- `docs/user-flow.md`: step 1 and 3 rewritten: the first open lands on the terminal; the welcome card is gone.
- `docs/high-level-design.md`: the Design Tree row.
- No new dependencies, assets or deploy changes. The glyph greeting uses the bundled font.

## Cross-Segment Effects

- **progression:** the welcome card leaves; the first-launch flag stays in progress state under its stored name; one spec revised.
- **reader:** the renderer (`Substituted`) is reused with the whole alphabet as its substitution set, which READ-007 already allows; no change.
- **alphabet:** the intro reads the font state to know when to start; no change.
- **persistence:** none. The progress shape is unchanged, so saved progress and exports stay valid.
- **layout:** the intro is full screen like the quiz; no reader chrome is shown with it.
- **offline:** the live-site check must go through the intro before it looks for the passage title.
- **feedback:** the Feedback button is not on the intro; feedback is one tap away once reading starts.

## Decisions Needed

Answered on 2026-10-17, as recommended.

1. **Replay from the library.** *Recommended:* yes, a Replay intro button in the library, so the intro can be watched again (and checked on dev without clearing the app's data). *Alternative:* no replay; the intro shows exactly once per device. *Answered:* yes.

## Risks and Edge Cases

- **Tests that open the app:** every browser test starts with `start()`, which today dismisses the welcome card; it will tap through the intro instead. The live-site check opens the app directly and waits for the passage title; it must go through the intro too, or production checks fail on the first deploy.
- **Typing takes time:** about 350 characters of English at 25 ms each is around 9 s. A tap finishes it (INTRO-005), and the browser tests tap rather than wait.
- **Font not yet loaded on first open:** the greeting would flash in the fallback font. The terminal shows only its cursor until the font has loaded or failed (INTRO-006); if the font failed, the greeting types in Latin and the English still explains the app.
- **Saved progress:** the flag keeps its stored name, so a learner who already dismissed the welcome card never sees the intro unless they replay it.
- **Reset:** resetting progress does not clear the flag today, and still does not; the intro is about the app, not the learned set.
- **Appearance (CO-007):** the terminal is always dark, by design; the Let's go button must stay readable on it in both appearances.
- **Mando'a vs the alphabet:** Mando'a is the language, the glyphs are its script; the text says the learner does not read Mando'a yet, as requested, and teaches the alphabet.

## Verification

- Unit tests for the script content, the typing schedule and the terminal's behavior with fake timers.
- Browser tests in WebKit (iPhone, iPad, laptop): the first open shows the terminal; the greeting's glyphs are in the glyph font and then in the reading font; Let's go lands on the passage; replay returns to the passage.
- CI passes; the pipeline deploys dev and the live check goes through the intro; the requester watches the intro on an iPhone.
- Production from `main` on their go.

---

## Outcome

Written before the requester's dev check; the production run is reported on the ticket. Checked on dev together with CO-007 and CO-008, which this branch carries.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 1 row | 1 row | |
| LLDs | 1 new, 3 sections in `progression` | 1 new, 3 sections in `progression`, 1 sentence in `content` | `content`'s Pagination section now says the area is measured when it appears (see Surprises) |
| Specs | +8 ~1 | +8 ~1, then ~2 | INTRO-001 to INTRO-008 added, PROG-014 revised, as predicted; INTRO-002 and INTRO-003 revised after the dev check (see Surprises 4) |
| Tests | 7 files | 8 files | `src/persistence/usePersistedProgress.test.tsx` also used the old names |
| Code | 6 files | 7 files | `src/content/usePagination.ts` fixed (see Surprises) |
| Other | User flow steps 1 and 3; HLD row | User flow steps 1, 2 and 3; HLD row | Step 2 gained the replay |

### Surprises

1. **The reader never paginated after the intro.** The pagination hook subscribed to the reading area once, keyed on a ref object that never changes. The welcome card was an overlay over an already mounted reader, so the area had always existed from the first render; the intro replaces the reader, so the area appeared later and was never measured, and Let's go landed on an empty page. The browser tests caught it on the first run. The hook now follows the area element itself, which also covers returning from the library or the quiz. This is the one cross-segment effect the prediction missed (`content`: "none").
2. **Fake timers and chained timeouts.** The terminal arms the next timer only after React commits the previous step, so advancing the fake clock in one call typed one character. The tests advance the clock one character at a time, as a browser would tick; the component was right.
3. **A fourth test file.** The persistence test for restoring progress used the old welcome names; the grep before coding found it, so it cost a minute, not a surprise at run time.
4. **The dev check asked for more Mandalorian, for longer.** The requester liked the intro but found the glyph greeting "too promptly dismissed, hard to see and properly enjoy", and asked for "a sprinkle of glyphs in the message". Three changes the same evening: the glyph greeting holds for 2.5 s instead of 0.9 s; it stays on screen while its English is typed beneath it, instead of being redrawn in place; and *Mando'a* and *Mandalorian* in the English lines are drawn in glyphs, growing as they are typed. INTRO-002 and INTRO-003 revised; `typing.ts`, `IntroTerminal.tsx`, `app.css`, both intro test files and `e2e/intro.spec.ts` touched again. The first design optimised for the "glyphs were English all along" reveal and forgot that the glyph line is the first Mandalorian the learner ever sees; a first impression wants time.

### Commits

| Hash | Message |
|---|---|
| `89a4a16` | CO-009 proposed: intro terminal (ZZF-69) |
| `843fa84` | Merge the finished CO-008 branch into the CO-009 branch (stacked for one dev check) |
| `9946683` | CO-009: the intro terminal (ZZF-69) |
| (this commit) | CO-009: the glyph greeting stays, and glyphs in the message (ZZF-69) |

### Measurements

| | |
|---|---|
| Tests before → after | unit 297 → 308, then 316; browser 69 → 75 passed, then 78, with the intro now in every test's start |
| Lines changed | +186 −51 (code, 7 files), +292 −47 (tests, 8 files), +104 −12 (design docs, specs, user flow and this change order); then about +70 −40 across the same intro files after the dev check |
| Agent time | about 18 minutes from the branch merge (16:50) to the outcome (17:08), plus about 15 minutes after the dev check |
| Deployed | dev from the branch by the pipeline; production when the pull requests merge |
