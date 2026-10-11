# Quiz Specs

**LLD**: docs/intent/quiz/quiz-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Availability

- `[ ]` **QUIZ-001**: The system SHALL show a quiz button in the reader controls at all times.
- `[ ]` **QUIZ-002**: While fewer than 2 letters are learned, the system SHALL disable the quiz button and show the reason "learn 2 letters first".
- `[ ]` **QUIZ-003**: While the bundled Mandalorian font is loading or has failed to load, the system SHALL disable the quiz button.

## Session

- `[ ]` **QUIZ-004**: When the learner starts a quiz, the system SHALL generate a session of exactly 10 questions, each with exactly 4 distinct choices of which exactly one is correct.
- `[ ]` **QUIZ-005**: When a quiz session starts, the system SHALL snapshot the learned set and newest letter and build every question in that session from the snapshot.
- `[ ]` **QUIZ-006**: If the learned set when a quiz session ends differs from the session's snapshot, then the system SHALL discard that session's answers and record nothing.
- `[ ]` **QUIZ-007**: When the learner leaves a quiz session before answering its last question, the system SHALL discard the session and record nothing.

## Question Types and Mix

- `[ ]` **QUIZ-008**: While 2 or more letters are learned, the system SHALL offer `glyph-to-letter` questions (prompt: one glyph; choices: 4 Latin letters) and `letter-to-glyph` questions (prompt: one Latin letter; choices: 4 glyphs).
- `[ ]` **QUIZ-009**: While fewer than 8 pool words qualify (a word qualifies when every letter in it is in the snapshot learned set), the system SHALL generate only letter questions.
- `[ ]` **QUIZ-010**: While 8 or more pool words qualify, the system SHALL offer `mando-to-english` questions (prompt: a word rendered fully in glyphs; choices: 4 English words) and `english-to-mando` questions (prompt: an English word; choices: 4 words rendered fully in glyphs), and make about half of the session word questions.
- `[ ]` **QUIZ-011**: The system SHALL make at least 3 questions in every session target the snapshot's newest letter, either as a letter question on that letter or as a word question whose answer word contains it; this takes precedence over the type mix in QUIZ-010.
- `[ ]` **QUIZ-012**: When no qualifying pool word contains the newest letter, the system SHALL make the questions required by QUIZ-011 letter questions.
- `[ ]` **QUIZ-013**: The system SHALL choose the target letters of the remaining questions from the snapshot learned set weighted toward lowest recent quiz accuracy, with a letter that has fewer than 5 recorded answers weighted highest.
- `[ ]` **QUIZ-014**: The system SHALL never show the same prompt in two consecutive questions of a session.

## Choices

- `[ ]` **QUIZ-015**: The system SHALL draw letter-question distractors from the snapshot learned set and, while fewer than 4 letters are learned, fill the remaining choices from the next unlearned letters in the progression order.
- `[ ]` **QUIZ-016**: The system SHALL draw word-question distractors from the qualifying pool with the same length as the answer word, falling back to the nearest lengths when fewer than 3 same-length words exist.
- `[ ]` **QUIZ-017**: While the qualifying pool has 10 or more words, the system SHALL not use the same answer word twice in one session.
- `[ ]` **QUIZ-018**: While at least 4 galaxy words (the Star Wars vocabulary group of the bundled pool) qualify, the system SHALL prefer galaxy words over everyday words as answer words.

## Answering and Result

- `[ ]` **QUIZ-019**: When the learner taps a choice, the system SHALL mark it right or wrong immediately, show the correct answer when wrong, and move to the next question after a short pause or on tap.
- `[ ]` **QUIZ-020**: The system SHALL impose no time limit on a quiz question or session.
- `[ ]` **QUIZ-021**: When the learner answers the last question of a session, the system SHALL show the score, the list of letters with at least one miss in that session, an "again" action and a return to the reader.
- `[ ]` **QUIZ-022**: The system SHALL show the quiz result screen whether or not storage is available.

## Recording

- `[ ]` **QUIZ-023**: When a session completes with an unchanged learned set, the system SHALL record one answer for each letter question and one answer per distinct letter of each word question's answer word, all answers from one word question sharing its correct or incorrect value, into that letter's ring in progression state (`Progress.quizByLetter`).

## Word Pool and Rendering

- `[ ]` **QUIZ-024**: The system SHALL bundle a lowercase word pool of 3- to 6-letter words in two groups, everyday English and galaxy vocabulary, each entry a single word or name.
- `[ ]` **QUIZ-025**: The system SHALL render every glyph and glyph word in the quiz through the reader substitution renderer, passing the letters of the item being shown as the substitution set.
