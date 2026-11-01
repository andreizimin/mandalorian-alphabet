# CO-015: Vendor the linked-intent-dev skill into the repository

| | |
|---|---|
| Type | Minor fix |
| Status | Done |
| Requested | 2026-11-01 |
| Approved | 2026-11-01 (as written; no decisions needed) |
| Completed | 2026-11-01 |
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

Written before the requester's dev check.

**The scope changed after approval.** Once v1.3.0 was on the branch, the requester asked for the latest release instead ("I need the latest 1.4 skill"). Asked how far to go, they chose the full upgrade: vendor `linked-intent-dev` and `update-lid` at v1.4.2, apply the 1.3 → 1.4 migration from the upstream CHANGELOG, and set `- Version: 1.4.2`. The Predicted Impact above is the original v1.3.0 prediction; the differences are recorded here.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | None | None | The tenet sweep found nothing to change (below) |
| LLDs | None | None | The misplaced-spec sweep found nothing to move (below) |
| Specs | None | None | |
| Tests | None | None | |
| Code | None | None | |
| Other | `linked-intent-dev` v1.3.0 (5 files), LICENSE, SOURCE.md, one CLAUDE.md line | `linked-intent-dev` v1.4.2 (7 files, adding `capability-flags.md` and `evals/`) and `update-lid` v1.4.2 (4 files), each with LICENSE and SOURCE.md; CLAUDE.md `## LID` version and the whole Linked-Intent Development section; one navigation row | `diff -r` against upstream `v1.4.2` shows only the added LICENSE and SOURCE.md |

### The 1.3 → 1.4 migration

- **Directives refresh (mechanical), applied.** The CLAUDE.md workflow section now follows the v1.4.2 template:
  - the pointer bullet (skill first, otherwise `docs/lid/workflow.md` from the v1.4.2 release);
  - the workflow in one line;
  - the bug-fix line;
  - the inspection invariant, which replaces "with stops between each phase";
  - *docs carry current intent*;
  - *memory vs. intent*.

  Two project lines are kept: *specs win when specs and code disagree*, and a sentence tying the inspection invariant to the requester's standing override in Change Orders step 3. The navigation table gains the template's decision-docs row.
- **Tenet sweep (judgment): nothing to change.** The HLD's three tenets (*Mandalorian polish over generality*, *Verification over uninterrupted flow*, *Convenience over device purity*) are each a one-line lean with no embedded procedure.
- **Misplaced-spec sweep (judgment): nothing to move.**
  - The mechanical screen found no requirement lines or status markers in any `*-design.md`.
  - The four spec IDs that design docs mention are citations, not definitions: `ANA-009` in `analytics`, `INTRO-008` in `help`, `PROG-014` in `intro` and `READ-002` in `reader`.
- **Informational items, no action.**
  - New audit finding classes.
  - Judgment reaching the requester by default.
  - Capability flags: none apply to the model that did this work.
  - No `.lid/` directory exists.
  - No workflow doc is vendored: Claude Code loads the skill directly.

### Surprises

1. **The latest release, not the declared one.** The prediction pinned the copy to the version CLAUDE.md declared. The requester wanted the latest, which brought the 1.3 → 1.4 migration with it.
2. **The skill is stricter than this project's process.** The LLD edge probe, the Phase 4 edge audit and the end-of-change coherence report are owed on every change, even with the phase stops consolidated. CO-013 skipped them as separate steps. CLAUDE.md now says they still run; the retroactive pass over CO-013 has been offered, not done.
3. **The phase-stop override needed a sentence.** The 1.4 inspection invariant reads as a stop after every phase. The project's standing override already consolidates inspection into the change order review, the decisions round and the dev check, so the refreshed section says so rather than leave the two in tension.

### Commits

| Hash | Message |
|---|---|
| `272fe7d` | CO-015 proposed: vendor the linked-intent-dev skill |
| `6c36006` | CO-015: vendor the linked-intent-dev skill (v1.3.0) |
| `2ef1f67` | CO-015: correct a line count in the outcome |
| (this commit) | CO-015: move to LID v1.4.2 with update-lid and the 1.3 → 1.4 migration |

### Measurements

| | |
|---|---|
| Tests before → after | unchanged (no code or test changes) |
| Lines changed | the two vendored skills, unmodified from upstream; CLAUDE.md's LID section rewritten (about +12 −6); this change order |
| Agent time | about 25 minutes, including reading both skills and the CHANGELOG |
| Deployed | dev from the branch by the pipeline (app unchanged); production when the pull request merges |
