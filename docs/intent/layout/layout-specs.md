# Layout Specs

**LLD**: docs/intent/layout/layout-design.md

Status markers: `[x]` implemented · `[ ]` active gap · `[D]` deferred

---

## Reading Column

- `[ ]` **LAYOUT-001**: The system SHALL cap the reading column at about 65 characters per line at any width.
- `[ ]` **LAYOUT-006**: The system SHALL let the learner set text size from 16 to 32 px, applied to both fonts equally.

## Controls

- `[ ]` **LAYOUT-002**: While the viewport is under 600 px wide, the system SHALL place reader controls in a bottom bar.
- `[ ]` **LAYOUT-003**: While the viewport is 600 px or wider, the system SHALL place reader controls in a top bar.
- `[ ]` **LAYOUT-004**: The system SHALL make every interactive control at least 44 by 44 pt.
- `[ ]` **LAYOUT-007**: While a passage page is shown, when the learner swipes left or taps a non-glyph point within the outer 15 % of the viewport width on the right, the system SHALL turn forward; when the learner swipes right or taps a non-glyph point within the outer 15 % on the left, the system SHALL turn back; a tap anywhere else on the page SHALL do nothing.
- `[x]` **LAYOUT-012**: While a passage page is shown, the system SHALL show back and forward page-turn buttons in a bar fixed to the bottom of the viewport, in the same screen position on every page, with back disabled on the first page.
- `[x]` **LAYOUT-013**: While a passage page is shown and focus is not in a text field, when the learner presses Right Arrow the system SHALL turn forward and when they press Left Arrow it SHALL turn back, unless Cmd, Ctrl or Alt is held.
- `[ ]` **LAYOUT-011**: The system SHALL open the library (the list of bundled and pasted passages with the paste action) in one tap from the reader controls.

## Quiz Screen

- `[ ]` **LAYOUT-008**: The system SHALL open the quiz as a separate full-screen view in one tap from the reader controls.
- `[ ]` **LAYOUT-009**: While the viewport is under 600 px wide, the system SHALL place the quiz's 4 choices in a 2 by 2 grid in the lower half of the viewport.
- `[ ]` **LAYOUT-010**: While the viewport is 600 px or wider, the system SHALL place the quiz's 4 choices in a 2 by 2 grid centered under the prompt.

## Platform

- `[ ]` **LAYOUT-005**: The system SHALL respect device safe areas and the system light or dark appearance.
