# CO-NNN: <Short title>

| | |
|---|---|
| Type | Feature · Bug · Minor fix |
| Status | Proposed · Approved · In progress · Done · Rejected |
| Requested | YYYY-MM-DD |
| Approved | YYYY-MM-DD |
| Completed | YYYY-MM-DD |
| Ticket | Linear ID, if any |

## Request

The change as asked for, in the requester's own words.

## Intent

What the change should achieve and why, in one or two sentences a cold reader understands. For a bug: what the app does, what it should do, and which spec (if any) it violates.

## Predicted Impact

Everything this change is expected to touch, level by level down the arrow. Fill in every level; write "None" where a level is unaffected rather than leaving it out.

### HLD

Sections of `docs/high-level-design.md` to change, and how. Tenets, goals or key decisions affected.

### LLDs

| Component | Section | Change |
|---|---|---|
| `component` | Section name | What changes and why |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `PREFIX-NNN` | Add · Revise · Delete | The EARS line as it will read |

### Tests

| File | Action | Specs covered |
|---|---|---|
| `src/.../x.test.ts` | Add · Change · Delete | `PREFIX-NNN` |

### Code

| File | Action | What changes |
|---|---|---|
| `src/.../x.ts` | Add · Change · Delete | Summary |

### Other

User flow, development log, assets, scripts, dependencies, hosting or deploy.

## Cross-Segment Effects

Components outside the main one that this change reaches, and what each one has to absorb. "None" if the change stays in one segment.

## Decisions Needed

Questions only the requester can answer, with a recommended option for each. Empty once approved.

## Risks and Edge Cases

What could go wrong or be misread, and how the plan guards against it.

## Verification

How "done" will be shown: which unit tests, browser tests, manual checks on a device, and whether a production deploy follows.

---

## Outcome

Filled in after the change is complete. This section is the record of how intent turned into code.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | n changes | n changes | |
| LLDs | n sections | n sections | |
| Specs | +a ~r −d | +a ~r −d | |
| Tests | n files | n files | |
| Code | n files | n files | |

### Surprises

Anything the prediction missed or got wrong, and why: a hidden dependency, a spec that turned out ambiguous, a test that exposed a wrong assumption.

### Commits

| Hash | Message |
|---|---|
| `abc1234` | ... |

### Measurements

| | |
|---|---|
| Tests before → after | unit n → n, browser n → n |
| Lines changed | +n −n (code), +n −n (tests), +n −n (docs) |
| Agent time | approximate active time |
| Deployed | YYYY-MM-DD, or not deployed |
