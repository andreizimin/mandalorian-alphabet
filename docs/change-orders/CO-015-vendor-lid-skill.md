# CO-015: Vendor the linked-intent-dev skill into the repository

| | |
|---|---|
| Type | Minor fix |
| Status | Proposed |
| Requested | 2026-11-01 |
| Approved | |
| Completed | |
| Ticket | none (asked in conversation) |

## Request

"Do both", in answer to the two ways of making the `linked-intent-dev` skill available to every session: commit it to the repository, and add it to the requester's claude.ai account.

## Intent

CLAUDE.md requires every code change to consult the `linked-intent-dev` skill, but the skill is installed only on the requester's laptop, so cloud sessions do not have it. CO-013 and CO-014 were both done without it. With the skill in `.claude/skills/linked-intent-dev/`, every session on this repository, cloud or local, loads it. The copy is version 1.3.0, the version the `## LID` block in CLAUDE.md declares, taken unchanged from the MIT-licensed upstream repository with its license.

Adding the skill to the claude.ai account is the requester's own step: no tool in a session can do it. This change order covers only the repository copy.

## Predicted Impact

### HLD

None.

### LLDs

None.

### Specs

None.

### Tests

None.

### Code

None in the app.

### Other

- `.claude/skills/linked-intent-dev/`: `SKILL.md` and its four reference files (`ears-syntax.md`, `lld-templates.md`, `hld-template.md`, `decision-doc-template.md`) from `jszmajda/lid` at tag `v1.3.0`, unchanged.
- `.claude/skills/linked-intent-dev/LICENSE`: the upstream MIT license.
- `.claude/skills/linked-intent-dev/SOURCE.md`: where the copy came from (repository, tag, commit) and how to update it.
- `CLAUDE.md`: one line saying the skill is vendored at `.claude/skills/linked-intent-dev/`, and that it is updated by re-copying from upstream at the version the `## LID` block declares.

## Cross-Segment Effects

None. The app, its tests and the pipeline are unchanged. The pipeline still deploys the branch to dev, where the app is the same.

## Decisions Needed

None.

## Risks and Edge Cases

- **Two copies on the laptop:** a laptop session may now see both the plugin and the repository copy. Both are version 1.3.0 and say the same thing, so whichever one loads, the guidance is the same.
- **Version drift:** the upstream plugin is at 1.4.2. The copy stays at 1.3.0 to match the declared LID version; moving to a newer one is a separate change, usually through the plugin's `update-lid` skill.
- **Skills the main skill mentions:** `SKILL.md` refers to `update-lid` (the bootstrap only, not needed in a configured project) and to `arrow-maintenance` (lifecycle events). Neither is vendored; their absence affects only those rare paths.

## Verification

- The copied files are byte-identical to upstream at `v1.3.0` (checked with `diff -r`).
- A session started on `main` after the merge lists `linked-intent-dev` among its skills.

---

## Outcome

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | None | | |
| LLDs | None | | |
| Specs | None | | |
| Tests | None | | |
| Code | None | | |
| Other | Skill (5 files), LICENSE, SOURCE.md, CLAUDE.md line | | |

### Surprises

### Commits

| Hash | Message |
|---|---|

### Measurements

| | |
|---|---|
| Tests before → after | |
| Lines changed | |
| Agent time | |
| Deployed | |
