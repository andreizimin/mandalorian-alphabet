# User Flow: Script Ramp

The journey of the primary user — a young Star Wars fan — from first open to reading fully in Mandalorian. Each step cites the specs that define it. This is a narrative view over the design tree, not a source of intent: when this file and a spec disagree, the spec wins and this file is updated.

## 1. First open

They open the link in Safari on their iPhone. The app loads once and from then on works offline (OFF-001). If the Mandalorian font is bundled it is already there; if its license forces the upload path, they are asked to add the font file once and it stays on the device (ALPHA-001 to ALPHA-004). Until a font is loaded, substitution and the quiz are both off, with a prompt to add one (ALPHA-004, QUIZ-003).

## 2. Picking something to read

Two or three bundled public-domain adventure or science-fiction passages of about 3,000 words, or any English text pasted in: fan fiction, a wiki article, a favorite chapter (TEXT-001, TEXT-002). The passage opens paginated, single column, never split mid-word (TEXT-003, LAYOUT-001).

## 3. Reading with no glyphs

The learned set starts empty, so the first page is plain English. The reader is the same one used throughout; nothing is substituted yet.

## 4. The first letter

They tap *advance*. An intro card shows the glyph for E, the letter E, and up to 3 words from this passage that contain it (PROG-002, PROG-003). After the card, every E on the page is a Mandalorian glyph and everything else is untouched (READ-001). Copy, paste and find-in-page still return English because the text underneath stays Latin (READ-002).

## 5. Reading, peeking, getting the hint

They read. When a glyph trips them up they tap it; the Latin letter appears for 1.5 seconds and the peek is counted for that letter (READ-004). After two pages with fewer than 2 peeks on E, a non-blocking hint says they are ready for the next letter and names reading as the reason (PROG-004). They can ignore it, or advance at any time with or without a hint (PROG-010). On the phone the controls sit in a bottom bar within thumb reach (LAYOUT-002); pages turn by swipe or edge tap (LAYOUT-007).

## 6. Second letter: the quiz unlocks

They advance to T. The quiz button in the controls, visible all along but disabled with "learn 2 letters first", becomes active (QUIZ-001, QUIZ-002). Tapping it opens a full-screen quiz of 10 questions, each with 4 big choices in a 2 by 2 grid in the lower half of the phone (LAYOUT-008, LAYOUT-009, QUIZ-004). With two letters learned every question is a letter question, "which letter is this glyph?" or "which glyph is T?", and the next unlearned letters fill out the four choices (QUIZ-008, QUIZ-009, QUIZ-015). At least 3 of the 10 target T, the newest letter (QUIZ-011). Right or wrong shows at once, a wrong answer shows the right one, and there is no timer (QUIZ-019, QUIZ-020). The result screen shows the score and the letters missed, with *again* and a return to reading (QUIZ-021).

## 7. The quiz feeds progression

Each answer is recorded against the letter it targeted, in a ring of the last 5 per letter (QUIZ-023, PROG-009). Once 4 of the last 5 answers on T are correct, the readiness hint fires and names the quiz as the reason (PROG-008). Either signal, reading or quiz, is enough on its own; neither is required to advance.

## 8. A few letters in: word questions

With E, T, A and O learned, enough short words qualify (*tea*, *toe*, *ate*, *oat*) that word questions appear: a word fully in glyphs with four English choices, or an English word with four glyph words (QUIZ-010). Once 4 galaxy words qualify (*mando*, *jedi*, *droid*), those are preferred as answers, and the quiz starts to feel like decoding transmissions rather than schoolwork (QUIZ-018, QUIZ-024).

## 9. Longer sessions on the iPad

The same app, no account, on the iPad: controls move to a top bar, the reading column stays at about 65 characters, and text size runs from 16 to 32 px for both fonts (LAYOUT-003, LAYOUT-001, LAYOUT-006). Split View and Slide Over behave because layout keys off viewport width, not device (LAYOUT-002, LAYOUT-003).

## 10. Stumbling, stepping back, resetting

If a letter arrived too soon, *step back* removes the newest one (PROG-005). *Reset*, after confirmation, clears the learned set and peek counts (PROG-006). The legend of learned letters is one tap away at all times (PROG-007).

## 11. About two hours in

All 26 letters render as glyphs. Success is reading a fully substituted page at near their normal pace, with quiz accuracy on letters learned a while ago staying high (HLD, Success Metrics).

## 12. Keeping it

They install the app to the Home Screen so it launches full screen and iOS does not evict its storage after a week unused (OFF-002). Progress exports as one JSON file and imports on another device after confirmation (PERS-002, PERS-003). If storage is unavailable the app still runs, with a banner that progress will not be saved (PERS-004).

## Open Questions

Steps where the journey is not yet backed by a spec:

1. **First-launch screen.** Whether the app opens to a passage list, a start card, or straight into a bundled passage is unspecified.
2. **Introducing the first letter.** PROG-002 covers each advance, but nothing says whether the first letter is introduced automatically or waits for a tap.
3. **Hint lifecycle.** Whether the readiness hint can be dismissed, and whether it returns on the next page, is unspecified.
4. **Navigation beyond the reader.** How the learner reaches paste-text and passage switching from the reader is unspecified beyond "reader controls".
