# Development Log: Learn Mandalorian

How the app at [learn-mandalorian.andreizimin.com](https://learn-mandalorian.andreizimin.com) was built: one person directing, one AI coding agent (Claude Code) doing the work, following the [Linked-Intent Development](https://github.com/jszmajda/lid) (LID) method. It covers the timeline, the numbers, the decisions, what went wrong and what the tests do and do not prove.

## At a Glance

| | |
|---|---|
| Wall-clock time | 16 h 43 min, Oct 10 16:51 to Oct 11 09:34 (Pacific), including an overnight break |
| Active working time | about 2 h 39 min (sum of gaps under 15 minutes between events) |
| First commit to feature-complete | 2 h 03 min (17:03 to 19:06) |
| Messages typed by the human | 43, about 25 of them one-word go-aheads ("go", "proceed", "apply all") |
| Multiple-choice decisions | 15 questions across 6 prompts |
| Agent responses | 218 (190 on Claude Opus 5.5, 28 on Claude Fable 5.1), plus 2 from one subagent |
| Tool calls | 393 |
| Output tokens | 350,380 |
| Total tokens processed | about 60.8 million, 97.5 % of them cached context reads |
| Commits | 26, all pushed to a private GitHub repo |
| Specs (EARS requirements) | 89, all implemented; 2 deleted along the way |
| Tests | 237 unit tests (26 files) and 35 browser tests in 4 browser configurations, all passing |
| Code | about 2,800 lines of app code, about 2,700 lines of tests, 876 lines of design docs |
| Deploys | 2: a throwaway test stage, then production |

## How the Work Was Organized

LID routes every change through the same arrow, with a stop for human review between phases:

```
HLD (high-level design) → LLD (design per component) → EARS specs → edge-case audit → tests → code
```

The project ended with one HLD over eight component designs (`alphabet`, `reader`, `progression`, `quiz`, `content`, `persistence`, `layout`, `offline`), each with its own numbered specs. Every test and every piece of code carries an `@spec` tag naming the requirement it serves, and a check after each component confirmed that no tag points to a missing spec and no spec lacks a test.

In practice the human set direction at the HLD stage and at each decision point, and approved each phase with a short reply. The agent wrote the documents, tests, code and commit messages, and asked whenever a choice belonged to the human.

## Timeline

All times Pacific.

### Oct 10, evening

| Time | What happened |
|---|---|
| 16:51 | Session starts. The human asks whether LID needs a special plugin; it is already installed. |
| 16:55 | `/linked-intent-dev` invoked. The repo already holds a draft HLD and seven component designs. |
| 16:55–17:03 | **Phase 1, HLD.** Tenets elicited through multiple-choice questions. The human re-targets the primary user to a young Star Wars fan, picks the static PWA architecture, and adds a quick quiz. HLD approved; git repo created and pushed. |
| 17:04 | Model switched to Claude Fable 5.1. |
| 17:04–17:24 | **Phases 2–4.** New `quiz` design, 15-gap edge-case probe by a subagent, 25 quiz specs, then a cross-spec audit that resolved 9 issues (hint firing instantly on a new letter, peek taps colliding with page-edge taps, first launch, navigation). User-journey document written on request. |
| 17:26 | Stack chosen by the human: Vite, React, TypeScript. Project scaffolded. |
| 17:26–17:39 | First tests written (Fable): alphabet and reader. |
| 17:40 | Model switched back to Claude Opus 5.5. |
| 17:40–17:46 | **The font.** Research found Mando AF by AurekFonts, public domain (CC0), verified inside the font file. The older version draws i/j and w/x identically, so version 002 was chosen. The human agreed that capital letters need no separate glyphs. Font bundled; upload flow deleted from specs and tests. |
| 17:52 | Alphabet and reader built. Mandalorian glyphs render on screen for the first time. |
| 17:57 | Progression built: learned letters, readiness hint, step back, reset, legend. |
| 17:59 | Human decides learners never reorder letters; that spec is deleted. |
| 18:05 | Persistence built: saving, recovery from corrupt data, export and import. |
| 18:09 | Bundled books chosen by measuring candidates for length, reading grade and rare-letter coverage: *The Call of the Wild*, *Treasure Island*, *The War of the Worlds*. Human chose to keep period language verbatim. |
| 18:16 | Human reports the next-page button jumping around and asks for arrow keys; fixed with a bottom bar and keyboard turns, both going through specs first. |
| 18:22 | Content built: real books, library, paste, pagination, page-read counting. |
| 18:33 | Quiz built: 33 tests passed on the first run of the code. |
| 18:51–18:56 | Layout: human picked the phone bar design from ASCII mockups and approved real-browser tests. Playwright with WebKit (Safari's engine) at iPhone, iPad and laptop sizes. |
| 18:52 | Hosting target given: `learn-mandalorian.andreizimin.com`. |
| 19:06 | Offline support, Home Screen icons and SST hosting config built. Every spec implemented. |
| 19:08–19:14 | Test stage deployed to a CloudFront URL; cache headers verified. |

### Oct 11, morning

| Time | What happened |
|---|---|
| 09:19–09:25 | Production deployed. HTTPS certificate, DNS record and HTTP-to-HTTPS redirect verified. |
| 09:32 | Human asks whether passing self-written tests means anything (see "What the Tests Prove"). |
| 09:34 | This log requested. |

## Usage

Counted from the session transcript. Every agent response re-reads the conversation so far, which is why cached reads dominate.

### Tokens

| | Responses | Output tokens | Cached context read | Cache written | Uncached input |
|---|---|---|---|---|---|
| Claude Opus 5.5 | 190 | 287,780 | 56,105,019 | 1,014,007 | 386 |
| Claude Fable 5.1 | 28 | 62,600 | 3,167,069 | 129,847 | 596 |
| Subagent (Opus 5.5) | 2 | 18 | 18,029 | 23,935 | 4 |
| **Total** | **220** | **350,398** | **59,290,117** | **1,167,789** | **986** |

Dollar cost is not computed here; it depends on the account's plan and per-model pricing.

### Tool Calls

| Tool | Calls | Used for |
|---|---|---|
| Bash | 132 | Tests, builds, git, installs, deploys, data analysis |
| Write | 124 | New files: docs, tests, code, commit messages |
| Edit | 96 | Changes to existing files |
| Read | 29 | Reading files and rendered images (font previews, icons, screenshots) |
| AskUserQuestion | 6 | The 15 multiple-choice decisions |
| WebSearch, WebFetch | 4 | Font licensing research |
| Agent | 1 | Independent edge-case probe of the quiz design |
| ToolSearch | 1 | Loading the web tools |

### Human Input

- 43 typed messages: about 25 one-word go-aheads, 2 screenshots with feedback, 1 pasted command, and the rest direction and questions.
- 15 multiple-choice answers covering tenets, quiz role, telemetry, stack, first segment, passage handling, page-turn direction, storage, phone layout, browser testing and app name.
- 2 model switches and 2 interrupted-and-resent messages.

## What Was Built

| Component | Specs | What it does |
|---|---|---|
| alphabet | 4 | Loads the bundled Mandalorian font; text stays in English until it is ready |
| reader | 7 | Draws learned letters as glyphs while the text underneath stays English; tap a glyph to peek |
| progression | 14 | One letter at a time in frequency order; "ready for the next letter" hint from reading or the quiz |
| quiz | 25 | 10-question sessions on letters and words, with Star Wars vocabulary as answers once the letters allow |
| content | 12 | Three public-domain books, pasted text, real pagination, place kept per book |
| persistence | 7 | Saves on every change, recovers from corrupt data, exports and imports a file |
| layout | 14 | Phone bottom bar and menu, top bar on wider screens, swipes, edge taps, arrow keys, text size |
| offline | 6 | Works offline after one visit, installs to the Home Screen, updates on next launch, hosting rules |

Assets produced by checked-in scripts:

- **Bundled passages:** generated from Project Gutenberg by `scripts/build_passages.py`, about 11,700 words in total.
- **Quiz word pool:** about 330 everyday words and 58 galaxy words, all 3–6 letters.
- **Home Screen icons:** drawn from the font by `scripts/build_icons.py`.

The built app is 320 KB of JavaScript (107 KB compressed), and the offline cache holds 349 KB.

## Decisions the Human Made

| Area | Decision |
|---|---|
| Users | Primary user is a young Star Wars and Mandalorian fan |
| Architecture | Static installable web app, no backend |
| Tenets | Mandalorian polish over generality; verification over uninterrupted flow; convenience over device purity |
| Quiz | A separate quick quiz, letters and words both ways, feeding the readiness hint without gating it |
| Telemetry | Full analytics allowed; recorded with a note on privacy for a young user |
| Stack | Vite, React and TypeScript |
| Font | Bundle Mando AF Regular; one case only |
| Letter order | Fixed frequency order, no reordering |
| Books | Keep *The Call of the Wild* verbatim, period language included |
| Page turns | Book direction; a bottom bar that never moves; arrow keys on a laptop |
| Phone layout | Arrows, Next letter, Quiz and a menu in the bottom bar |
| Testing | Real-browser tests in Safari's engine |
| Name and host | "Learn Mandalorian" at `learn-mandalorian.andreizimin.com` |
| Deploy | Test stage first, then production, each approved explicitly |

## What Went Wrong

### Failing Tests

Nine test failures or near-failures came up during development. All nine were mistakes in the tests; none exposed a bug in the code.

| Test | Mistake |
|---|---|
| Passage page | Counted 8 substituted letters where the sample had 11 |
| Substitution | Forgot the capital C in "Café" and the e in "line" |
| Intro card | Picked "open" where "gate" comes first (caught before the code existed) |
| Paste title | Took the title from two paragraphs instead of one (caught before the code existed) |
| Paste | Used "été über" as text with no English letters; it contains t, b, e and r |
| Import panel | Checked the screen before the file had finished reading |
| Quiz screen | A helper typed too loosely for the typechecker |
| Quiz generator | A galaxy-word check ignored the no-repeat rule (caught before the code existed) |
| Offline | Expected "Buck" on the first page, which opens with a poem |

### Process Slips

- Tests written for a font-upload flow had to be rewritten once the bundled font was found. The font question was still open when those tests were written.
- Persistence's test helper (`Blob.text`) and Vitest's picking up of browser-test files needed environment fixes, not code changes.
- Commit commands with inline messages triggered a permission prompt every time. The fix was one fixed command that reads the message from a file.
- One commit bundled an extra command and caused one extra prompt after that fix.

## What the Tests Prove

The same agent wrote the specs, the tests and the code, so tests passing on the first try is weak evidence on its own. Each time a test failed, the agent decided whether the test or the code was wrong. That judgment was checked against the spec or the source text, but by no one independent.

What strengthens the tests:

- **Tests came before the code.** The human saw each test file before the code existed, so the target could not drift while the code was written.
- **Property tests for the quiz.** Every rule was checked across 300 random sessions at 7 learning stages, which is much harder to satisfy by accident than one example.
- **Real-browser tests.** These measure what Safari's engine actually renders: overflow, positions and tap-target sizes. Several passed against code written before they existed, and they confirmed pagination on iPhone, iPad and laptop sizes, which the unit tests cannot see.

Where the tests are weak:

- **Settings checked instead of behavior.** Update timing is verified by reading the configuration, not by deploying two versions; the safe-area check only confirms padding exists.
- **Shared reading of the rules.** The quiz tests and the quiz code come from the same reading of the specs, so a misreading would pass.
- **No test of the goal.** Whether a learner reads Mandalorian at near-normal pace after about two hours can only be measured by use.

Suggested next checks: mutation testing (deliberately breaking the code and counting what the tests miss), a review by a fresh agent that sees only the specs, and a week of real use on the iPhone.

## Where Things Live

| | |
|---|---|
| Live app | https://learn-mandalorian.andreizimin.com |
| Repository | https://github.com/andreizimin/mandalorian-alphabet (private) |
| High-level design | `docs/high-level-design.md` |
| Component designs and specs | `docs/intent/<component>/` |
| User journey | `docs/user-flow.md` |
| Commands | `CLAUDE.md` |

## How These Numbers Were Measured

- **Times** come from the session transcript and git commit timestamps, converted to Pacific time.
- **Active time** adds up every gap shorter than 15 minutes between transcript events; longer gaps count as breaks.
- **Tokens** are summed from the usage reported on each agent response, counting each response once.
- **Typed messages** exclude tool results, background-task notifications, interrupted duplicates and local commands such as model switches.
- **Line counts** cover files tracked in git; app code excludes tests and the generated passage files.
- The figures were taken when this log was requested, so the work of writing the log itself is not included.
