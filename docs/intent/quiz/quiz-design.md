---
parent: high-level-design
prefix: QUIZ
---

# Quiz

## Context and Design Philosophy

Reading builds recognition; the quiz checks it. A quick quiz is a short, self-contained multiple-choice session, started on purpose from its own screen and never injected into a passage. It asks only about letters the learner has already met, it is over in about a minute, and its results feed the readiness hint in `progression` without ever gating advancement. For a Star Wars fan the quiz should feel like decoding transmissions, not like a vocabulary test, so the word pool leans on Star Wars and Mandalorian vocabulary wherever the learned set allows it.

## Availability

The quiz button is always visible from the reader controls. It is disabled, with a one-line reason, while any of these hold:

- fewer than 2 letters are learned ("learn 2 letters first");
- the bundled Mandalorian font is loading or has failed to load (the same condition that disables substitution in `alphabet`).

## Question Types

| Type | Prompt | Choices | Available when |
|---|---|---|---|
| `glyph-to-letter` | One glyph in the target font | 4 Latin letters | 2 or more letters learned |
| `letter-to-glyph` | One Latin letter | 4 glyphs in the target font | 2 or more letters learned |
| `mando-to-english` | A word rendered fully in glyphs | 4 English words in the reading font | 8 or more pool words qualify |
| `english-to-mando` | An English word in the reading font | 4 words rendered fully in glyphs | 8 or more pool words qualify |

A word qualifies for the pool when every letter in it is in the learned set, so word questions render fully in glyphs with no Latin letters to lean on. Under the default frequency order the first word questions appear after about 4 letters (E, T, A, O: *tea*, *toe*, *ate*, *oat*...), and the pool grows quickly from there.

## Word Pool

A bundled list of short lowercase words, 3 to 6 letters, in two groups:

- **Everyday English:** common words a young reader reads without effort.
- **Galaxy vocabulary:** names and terms from the Star Wars and Mandalorian universe (*jedi*, *droid*, *beskar*, *mando*, *creed*, *clan*...). Single words and names are not copyrightable text; no passage text from the franchise is bundled. Names are stored and shown lowercase; the glyph font is unicase, so case carries no information.

The lists live in `src/quiz/wordPool.ts`: about 330 everyday words, front-loaded with words built from the most frequent letters (*tea*, *toe*, *ate*, *ten*, *note*...) so word questions start early, and about 60 galaxy words. Twelve words already qualify once E, T, A and O are learned. Every entry is lowercase a–z, 3 to 6 letters, and appears in only one group.

Each session draws from the whole qualifying pool. While at least 4 galaxy words qualify, galaxy words are preferred as answers. Distractor words are drawn from the same pool, distinct from each other and from the answer, and have the same length as the answer; when fewer than 3 same-length words exist, the nearest lengths fill in. While the qualifying pool has 10 or more words, no answer word repeats within a session.

## Session

A session is 10 questions. Each question has exactly 4 distinct choices, one correct.

**Snapshot.** The learned set and the newest letter are fixed when the session starts. If the learned set differs at the end (advance, step back or reset happened meanwhile, for example in another tab), the session's answers are discarded.

**Targeting.** At least 3 questions target the newest learned letter: a letter question on that glyph, or a word question whose answer word contains it. When no qualifying word contains the newest letter, all 3 are letter questions. The remaining questions spread over the rest of the learned set, with selection weighted toward letters with the lowest recent accuracy; a letter with fewer than 5 recorded answers is weighted highest, as the least certain.

**Type mix.** While no word questions are available, all questions are letter questions. Once word questions are available, about half the session is word questions; the newest-letter rule above takes precedence over the mix.

**Choices.** Letter distractors are drawn from the learned set. While fewer than 4 letters are learned, the remaining choices are filled from the next unlearned letters in the progression `order[]`. `letter-to-glyph` choices therefore may show glyphs the learner has not met; the quiz renders any letter it asks about, not just the learned set. No two consecutive questions have the same prompt (with exactly 2 letters learned, letter questions alternate between them).

**Answering.** The learner taps a choice. The app marks it right or wrong at once, shows the correct answer when wrong, and moves on after a short pause or on tap. There is no timer and no penalty beyond the record.

**Leaving.** Leaving mid-session discards that session; nothing partial is recorded.

**Result.** The result screen shows the score and lists every letter that had at least one miss in the session, with a one-tap "again" and a return to the reader. The result screen shows even when storage is unavailable; the `persistence` banner is what tells the learner progress is not being saved.

## Data

`QuizAnswer { at, type, letter, correct }` where `letter` is one letter the question targeted.

A letter question records one `QuizAnswer`. A word question records one `QuizAnswer` for each **distinct** letter in the answer word, all with the same `correct` value: a wrong word answer means the learner could not decode the word, so every letter in it is suspect.

Per-letter recent accuracy, kept by `progression` in `Progress.quizByLetter`, is a ring of the last 5 answers targeting that letter. One session can fill a letter's whole ring; that is intended, since one good session on the newest letter is enough evidence for a hint. The ring is written once, at the end of a complete session.

## Rendering

Glyphs and glyph words are rendered by the `reader` substitution renderer with an explicit letter set, so the quiz and the passage always look identical. The quiz passes the set of letters in the item being rendered, not the learned set; for pool words that is every letter, and for filler choices it may include letters not yet learned.

## Layout

The quiz is its own screen, reachable in one tap from the reader controls. Choices are a 2 by 2 grid in the lower half of the screen so iPhone use stays one-thumb; on wider viewports the grid is centered under the prompt. Tap targets follow the `layout` minimums.

## Decisions & Alternatives

| Decision | Chosen | Alternatives Considered | Rationale |
|---|---|---|---|
| Relation to advancing | Optional; feeds the readiness hint only | Gate advancement on a passing quiz; standalone practice with no effect | A gate takes pace control away from the learner and can strand a stuck kid; a standalone quiz would make verification change nothing. Feeding the hint keeps the learner in control and still gives verification a real effect |
| Word rendering | Only words whose letters are all learned, rendered fully in glyphs | Any word, with partial substitution as in reading | A partially substituted word is readable from its Latin letters, so it tests nothing. Full substitution tests recognition; the pool starts small and grows with the learned set |
| Word source | Bundled everyday plus galaxy word list | Words drawn from the current passage | Passage words are long and rare early on and give no franchise flavor; a curated list qualifies sooner and lets the quiz feel like part of the universe |
| Session shape | Fixed 10 questions, 4 choices, no timer | Endless mode; timed rounds | A fixed short session fits a phone break and makes scores comparable; a timer adds pressure that reading fluency does not need |
| Recording unit | One answer per distinct targeted letter, last 5 kept per letter | Session history; one answer per word | The readiness hint needs recent per-letter accuracy; a small ring gives that without unbounded storage, and per-letter records let word questions feed it |
| Wrong word answer | Miss recorded for every letter in the word | Miss only for the newest letter | The quiz cannot tell which letter failed; spreading the miss is honest, and the 5-answer ring forgets it quickly for letters the learner does know |
| Mid-session exit | Discard the session | Record answered questions | Partial sessions would skew per-letter rings toward the easy questions answered first |
| Learned set changes mid-session | Discard the session | Record against the snapshot | Rare, and recording against a stale set could credit a letter that was just stepped back |
| Unlearned filler choices | Allowed, rendered as glyphs | Fewer than 4 choices early on; quiz unavailable below 4 letters | A fixed 4-choice shape keeps the screen stable; an unfamiliar glyph as a distractor makes early questions easier, which suits a learner with 2 or 3 letters |

## Open Questions & Future Decisions

### Resolved
1. ✅ Word lists chosen and bundled (see Word Pool).

### Deferred
1. Word questions give screen readers the Latin spelling through the reader's accessible labels, which reveals the answer. The quiz is visual by nature; decide whether to suppress the label inside the quiz or leave it.
2. Whether a session may mix an upcoming letter in (a "sneak peek" question) once accuracy on the whole learned set is high.

## References

- `docs/intent/progression/progression-design.md` for how quiz results enter the readiness hint.
- `docs/intent/reader/reader-design.md` for the substitution renderer.
