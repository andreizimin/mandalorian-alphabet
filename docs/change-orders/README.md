# Change Orders

Every change to the app, whether feature, bug or minor fix, starts as a change order: a document that predicts, before any work begins, everything the change will touch along the arrow of intent (HLD → LLDs → specs → tests → code). Once the change is done, its Outcome section records what was actually touched, so each change shows how well intent predicted code.

## How a Change Flows

1. **Request.** The change is described in conversation or as a Linear ticket.
2. **Change order.** A new `CO-NNN-short-slug.md` is written from [TEMPLATE.md](TEMPLATE.md) with status *Proposed*: the predicted impact at every level, cross-segment effects, decisions needed, risks and the verification plan. No design doc, spec, test or code changes before this.
3. **Approval.** The requester reviews the change order, answers its open decisions and approves it. Status becomes *Approved* (or *Rejected*, and the file stays as a record).
4. **Work.** The change walks the LID arrow as predicted. Minor fixes go through in one pass; features stop for review between phases. When the work departs from the prediction, the change order is updated rather than the departure going unrecorded.
5. **Outcome.** The Outcome section is filled in: predicted vs actual at each level, surprises, commits and measurements. Status becomes *Done*, and the row below is updated.

## Numbering

`CO-001`, `CO-002`, and so on, never reused. The slug is a few lowercase words, for example `CO-004-streak-counter.md`.

## Index

| ID | Title | Type | Status | Specs predicted | Specs actual |
|---|---|---|---|---|---|
| [CO-001](CO-001-highlight-newest-letter.md) | Highlight the newest letter | Feature | Done | +5 | +5 (1 reworded) |
| [CO-002](CO-002-feedback-button.md) | Feedback button in the top bar ([ZZF-56](https://linear.app/zizify-workshop/issue/ZZF-56)) | Feature | Done | +5 ~1–2 | +5 ~1 |
| [CO-003](CO-003-stale-feedback-widget.md) | Stale cached feedback widget breaks the Feedback button ([ZZF-61](https://linear.app/zizify-workshop/issue/ZZF-61)) | Bug | Done | +1 ~1 | +1 ~1 |
| [CO-004](CO-004-dev-environment.md) | Dev environment and branch flow ([ZZF-62](https://linear.app/zizify-workshop/issue/ZZF-62)) | Feature | Done | +2–3 ~1 | +2 ~2 |
| [CO-006](CO-006-ci-cd.md) | CI/CD with one manual step ([ZZF-66](https://linear.app/zizify-workshop/issue/ZZF-66)) | Feature | Done | +3 | +3 |
