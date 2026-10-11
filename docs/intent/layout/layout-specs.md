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
- `[ ]` **LAYOUT-007**: When the learner swipes horizontally or taps a page edge, the system SHALL turn the page.

## Platform

- `[ ]` **LAYOUT-005**: The system SHALL respect device safe areas and the system light or dark appearance.
