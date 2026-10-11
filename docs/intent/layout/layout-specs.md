# Layout Specs

**LLD**: docs/intent/layout/layout-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Reading Column

- `[ ]` **LAYOUT-001**: The system SHALL cap the reading column at about 65 characters per line at any width.
- `[ ]` **LAYOUT-006**: The system SHALL let the learner set text size from 16 to 32 px in 2 px steps (default 20 px), applied to the reading font and the glyph font equally, and SHALL re-paginate keeping the learner on the word they were reading.

## Controls

- `[ ]` **LAYOUT-002**: While the viewport is under 600 px wide, the system SHALL show a bottom bar with the back page-turn button, Next letter, Quiz, a menu button and the forward page-turn button, and SHALL place Step back, Reset, Legend, Library and text size in a menu sheet opened from that bar.
- `[ ]` **LAYOUT-003**: While the viewport is 600 px or wider, the system SHALL place Next letter, Quiz, Step back, Reset, Legend, Library and text size in a top bar, and only the page-turn buttons in the bottom bar.
- `[ ]` **LAYOUT-014**: When the learner chooses Step back, Reset, Legend or Library in the phone menu sheet, or taps outside it, the system SHALL close the sheet; the text-size buttons SHALL leave it open so the size can be stepped repeatedly.
- `[ ]` **LAYOUT-004**: The system SHALL make every interactive control at least 44 by 44 pt.
- `[ ]` **LAYOUT-007**: While a passage page is shown, when the learner swipes left (at least 50 px horizontally, more horizontal than vertical) or taps a non-glyph point within the outer 15 % of the viewport width on the right, the system SHALL turn forward; when the learner swipes right or taps a non-glyph point within the outer 15 % on the left, the system SHALL turn back; a tap anywhere else on the page SHALL do nothing.
- `[x]` **LAYOUT-012**: While a passage page is shown, the system SHALL show back and forward page-turn buttons in a bar fixed to the bottom of the viewport, in the same screen position on every page, with back disabled on the first page.
- `[x]` **LAYOUT-013**: While a passage page is shown and focus is not in a text field, when the learner presses Right Arrow the system SHALL turn forward and when they press Left Arrow it SHALL turn back, unless Cmd, Ctrl or Alt is held.
- `[ ]` **LAYOUT-011**: The system SHALL open the library (the list of bundled and pasted passages with the paste action) from the reader controls: in one tap from the top bar at 600 px or wider, and from the menu sheet under 600 px.

## Quiz Screen

- `[ ]` **LAYOUT-008**: The system SHALL open the quiz as a separate full-screen view in one tap from the reader controls at every width.
- `[ ]` **LAYOUT-009**: While the viewport is under 600 px wide, the system SHALL place the quiz's 4 choices in a 2 by 2 grid in the lower half of the viewport.
- `[ ]` **LAYOUT-010**: While the viewport is 600 px or wider, the system SHALL place the quiz's 4 choices in a 2 by 2 grid centered under the prompt.

## Platform

- `[ ]` **LAYOUT-005**: The system SHALL respect device safe areas and the system light or dark appearance.
