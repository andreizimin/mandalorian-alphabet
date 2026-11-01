# CO-014: Explicit dev-check question before merging

| | |
|---|---|
| Type | Minor fix |
| Status | Done |
| Requested | 2026-11-01 |
| Approved | 2026-11-01 (as written; no decisions needed) |
| Completed | 2026-11-01 |
| Ticket | none (asked in conversation) |

## Request

"add the explicit dev-check question to CLAUDE.md". This follows CO-013, where "go, merge it" was taken as the dev check, and the requester then asked why the change had not waited on dev for their confirmation.

## Intent

The requester's check on dev is the one manual step, and the agent must not infer it. After CI deploys a change to dev, the agent asks one explicit, standalone question: has the requester checked this commit on dev? It asks this as a multiple-choice question, not inside a status message. Only an explicit "yes, checked on dev" lets the pull request merge. A bare "go" or "merge it" gets the question, not a merge. When dev is serving a different commit from the branch head (two pipeline runs can finish their deploys out of order), the question names both commits.

## Predicted Impact

### HLD

Change flow paragraph: "on their go" becomes "once they confirm, in answer to an explicit question, that they checked it on dev".

### LLDs

None. The pipeline in the `offline` LLD is unchanged; only the agent's process around it changes.

### Specs

None. This is process, not app behaviour.

### Tests

None.

### Code

None.

### Other

- `CLAUDE.md`: Change Orders steps 5 and 6, and step 4 of "process ZZF-NN", require the explicit question and say what counts as the go.

## Cross-Segment Effects

None. No app code, test or pipeline changes. The pipeline still deploys this branch to dev, where the app is unchanged.

## Decisions Needed

None.

## Risks and Edge Cases

- **An extra round trip:** a requester who has already checked dev and says "go, checked" answers the question in passing, so the wording counts any explicit statement that they checked dev as the yes.
- **Out-of-order dev deploys:** the question names the commit dev serves when it differs from the branch head, so the requester knows what they are approving.

## Verification

The next change's merge waits on the question. This change is the first case: after CI deploys it to dev, the agent asks the question before merging.

---

## Outcome

Written before the requester's dev check.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | 1 sentence | 1 sentence | Change flow paragraph |
| LLDs | None | None | |
| Specs | None | None | |
| Tests | None | None | |
| Code | None | None | |
| Other | CLAUDE.md, 3 steps | CLAUDE.md, 3 steps | Change Orders steps 5 and 6; "process ZZF-NN" step 4 |

### Surprises

None. Step 5 also names both commits when dev serves a different one from the branch head, which CO-013 ran into; the Intent had predicted that.

### Commits

| Hash | Message |
|---|---|
| `2d0f7c9` | CO-014 proposed: explicit dev-check question before merging |
| (this commit) | CO-014: explicit dev-check question before merging |

### Measurements

| | |
|---|---|
| Tests before → after | unchanged (no code or test changes) |
| Lines changed | +4 −4 (CLAUDE.md, HLD), plus this change order |
| Agent time | about 5 minutes |
| Deployed | dev from the branch by the pipeline (app unchanged); production when the pull request merges |
