# User Flow: Script Ramp

The journey of the primary user — a young Star Wars fan — from first open to reading fully in Mandalorian. Each step cites the specs that define it. This is a narrative view over the design tree, not a source of intent: when this file and a spec disagree, the spec wins and this file is updated.

## 1. First open

They open the link in Safari on their iPhone. An old Mandalorian terminal fills the screen and types "Hello, adventurer!" in glyphs they cannot read, then turns the line into English before their eyes (INTRO-001, INTRO-002). It goes on in English: they don't read Mando'a yet, nobody does on day one, and here is how they will learn, one letter at a time inside real stories (INTRO-003). A tap finishes the typing if they are impatient (INTRO-005), and **Let's go** opens the first passage (INTRO-004). The app loads once and from then on works offline (OFF-001). The Mandalorian font ships with the app, so there is nothing to upload or install (ALPHA-001); the terminal waits for it before typing (INTRO-006). If the font ever fails, a message offers a retry (ALPHA-003).

## 2. Straight into a passage

Let's go lands on the first bundled passage (TEXT-005): paginated, single column, never split mid-word (TEXT-003, LAYOUT-001). The library, one tap from the controls, lists the two or three bundled public-domain adventure or science-fiction passages and holds the paste action for any English text: fan fiction, a wiki article, a favorite chapter (TEXT-001, TEXT-002, TEXT-006, LAYOUT-011). The intro can be replayed from there too (INTRO-008).

## 3. Reading with no glyphs

The learned set starts empty, so the first page is plain English, and nothing is substituted until they tap *Next letter*, as the terminal said (PROG-014).

## 4. The first letter

They tap *advance*. An intro card shows the glyph for E, the letter E, and up to 3 words from this passage that contain it (PROG-002, PROG-003). After the card, every E on the page is a Mandalorian glyph and everything else is untouched (READ-001). The newest letter's glyphs are drawn in the app's accent color, the same color the intro card used, so the letter being learned is easy to spot; older glyphs stay in the text color (READ-008, PROG-015). Copy, paste and find-in-page still return English because the text underneath stays Latin (READ-002).

## 5. Reading, peeking, getting the hint

They read. When a glyph trips them up they tap it, wherever it sits on the page; the whole word appears in English right under it for 1.5 seconds, the tapped letter marked, and the peek is counted for that letter (READ-004, READ-010). To check a whole phrase they highlight it, and the English of the selection floats above it until they let the selection go (READ-011). After two pages read since E arrived with fewer than 2 peeks on it, a non-blocking hint says they are ready for the next letter and names reading as the reason (PROG-004). They can dismiss it, which keeps it away until they advance (PROG-012), or advance at any time with or without a hint (PROG-010). On the phone the controls sit in a bottom bar within thumb reach (LAYOUT-002); pages turn with the ← and → buttons fixed at the bottom of the screen (LAYOUT-012), by swipe, or by a tap on the outer edges of the page away from any glyph (LAYOUT-007); on a laptop the arrow keys work too (LAYOUT-013). Turning back to re-read never counts as new reading (TEXT-011), and the last page of a passage ends with a card offering the next passage or the library (TEXT-012).

## 6. Second letter: the quiz unlocks

They advance to T, and the highlight moves from E to T (READ-008). The quiz button in the controls, visible all along but disabled with "learn 2 letters first", becomes active (QUIZ-001, QUIZ-002). Tapping it opens a full-screen quiz of 10 questions, each with 4 big choices in a 2 by 2 grid in the lower half of the phone (LAYOUT-008, LAYOUT-009, QUIZ-004). With two letters learned every question is a letter question, "which letter is this glyph?" or "which glyph is T?", and the next unlearned letters fill out the four choices (QUIZ-008, QUIZ-009, QUIZ-015). At least 3 of the 10 target T, the newest letter (QUIZ-011). Right or wrong shows at once, a wrong answer shows the right one, and there is no timer (QUIZ-019, QUIZ-020). The result screen shows the score and the letters missed, with *again* and a return to reading (QUIZ-021).

## 7. The quiz feeds progression

Each answer is recorded against the letter it targeted, in a ring of the last 5 per letter (QUIZ-023, PROG-009). Once 4 of the last 5 answers on T are correct, the readiness hint fires and names the quiz as the reason (PROG-008). Either signal, reading or quiz, is enough on its own; when both hold, one hint names both (PROG-011). Neither is required to advance.

## 8. A few letters in: word questions

With E, T, A and O learned, enough short words qualify (*tea*, *toe*, *ate*, *oat*) that word questions appear: a word fully in glyphs with four English choices, or an English word with four glyph words (QUIZ-010). Once 4 galaxy words qualify (*mando*, *jedi*, *droid*), those are preferred as answers, and the quiz starts to feel like decoding transmissions rather than schoolwork (QUIZ-018, QUIZ-024).

## 9. Longer sessions on the iPad

The same app, no account, on the iPad: controls move to a top bar, the reading column stays at about 65 characters, and text size runs from 16 to 32 px for both fonts (LAYOUT-003, LAYOUT-001, LAYOUT-006). Split View and Slide Over behave because layout keys off viewport width, not device (LAYOUT-002, LAYOUT-003). Reading in bed, they tap the appearance button from Auto to Dark and the page goes dark whatever the iPad is set to; the choice is remembered (LAYOUT-017).

## 10. Stumbling, stepping back, resetting

If a letter arrived too soon, *step back* removes the newest one and forgets its peeks and quiz answers, so it starts fresh next time (PROG-005). *Reset*, after confirmation, clears the learned set, peek counts and quiz rings (PROG-006). The legend of learned letters is one tap away at all times (PROG-007).

## 10b. Sending feedback

If something is confusing or broken, or they have an idea, they tap **Feedback**: in the top bar on an iPad or laptop, at the top right of the title line on a phone (LAYOUT-016). The shared feedback form opens over the page, and page turns pause until it closes (FEED-002, FEED-004). Offline, the button is greyed out with "Feedback needs a connection" (FEED-003).

## 11. About two hours in

All 26 letters render as glyphs; *advance* is disabled and the hint retires (PROG-013). Success is reading a fully substituted page at near their normal pace, with quiz accuracy on letters learned a while ago staying high (HLD, Success Metrics).

## 12. Keeping it

They install the app to the Home Screen so it launches full screen and iOS does not evict its storage after a week unused (OFF-002). From the library, progress and pasted passages export as one JSON file and import on another device after confirmation (PERS-002, PERS-003). If storage is unavailable the app still runs, with a banner that progress will not be saved (PERS-004).

## Open Questions

None: every step above is backed by a spec. Add to this list when a step in the journey outruns the specs.
