# Script Ramp (mandalorian-alphabet)

## LID
- Mode: Full
- Version: 1.4.2

## Linked-Intent Development (MANDATORY)

**Consult the `linked-intent-dev` skill for ALL code changes.** It is vendored with `update-lid` at `.claude/skills/`, at the version in the `## LID` block above, so every session has them; see each skill's `SOURCE.md` for updating. All changes flow through the arrow of intent in one direction:

```
HLD → LLDs → EARS → Tests → Code
```

- **All changes**: consult the `linked-intent-dev` skill if your harness provides it; otherwise read `docs/lid/workflow.md` before making changes, and if it is missing and `## LID` records no decline, offer the user once to add it from https://raw.githubusercontent.com/jszmajda/lid/v1.4.2/plugins/linked-intent-dev/skills/update-lid/references/workflow-doc.md (on decline, add `- Workflow doc: declined` to `## LID`). The workflow in one line: HLD check → LLD → EARS specs → edge audit → failing tests first → code — inspected at each phase.
- **Bug fixes**: walk the arrow like any other change — find where behavior diverged from intent and cascade from there. No short-circuit.

Each phase's output is inspected — by the user or an inspector they name — before the next begins; ambiguous spec readings go back to the user. In this project the requester's standing override (Change Orders step 3) consolidates those inspections into the change order review, the Decisions Needed round and the dev check; the LLD edge probe, the edge audit and the coherence report still run, and any spec that admits two readings still goes back to the requester before tests. When specs and code disagree, specs win: fix the code, or fix the spec and cascade. **Docs carry current intent, written to be read cold** — write each doc as if authored fresh today, from current intent alone: no narration of how it changed, no meaning that needs the conversation that produced it, no rebuttals to questions only a past discussion raised. Rationale, considered alternatives, and constraints a fresh author would independently write stay; record rejected alternatives and why in the LLD's Decisions & Alternatives table, not as asides in body prose.

**Memory vs. intent.** Before saving durable project knowledge to agent or tool memory, test whether it is project *intent* — would a fresh agent, in any tool, next session, need it to build this system correctly? If yes, record it in the arrow (HLD / LLD / EARS / decision doc), which travels and cascades — not in private, per-tool memory, where intent escapes the arrow. Knowledge about the user or how they like to work stays in memory.

## Change Orders (MANDATORY)

**Every change — feature, bug or minor fix — starts with a change order, before any design doc, spec, test or code is touched.**

0. Work on a branch: every change order gets its own branch, named after its ticket (for example `zzf-62-dev-environment`), created before any change.
1. Copy `docs/change-orders/TEMPLATE.md` to `docs/change-orders/CO-NNN-short-slug.md` (next unused number) and fill in the predicted impact at every level of the arrow, cross-segment effects, decisions needed, risks and verification. Status: *Proposed*. Add its row to the index in `docs/change-orders/README.md`.
2. If the change order has Decisions Needed, ask them all in one round (multiple choice, recommendation first) before working; that is the only stop before the dev check. With the answers recorded, the change order is *Approved*; otherwise it is approved as written.
3. Walk the LID arrow as predicted, without stopping between phases (the requester's standing override of the LID phase stops). If the work departs from the prediction, update the change order as it happens.
4. Fill in the Outcome (predicted vs actual per level, surprises, commits, measurements) before the dev check, and set status *Done* with the completion date in the change order and its index row, so nothing is left to commit after the merge. The status takes effect when the pull request merges; if the requester sends the change back, set it back.
5. Push and open a pull request into `main` linking the change order. The pipeline (`.github/workflows/ci.yml`) tests the push, deploys it to dev and runs the live-site check. When it passes, tell the requester it is on dev, naming the commit, and present the change order with it. **The requester's check on dev is the one manual step.**
6. On their go, merge the pull request (`gh pr merge --merge --delete-branch`) if the branch head is still the commit they checked; if it has moved, say so and ask again. The merge deploys production and runs the live-site check there. When that run passes, set status *Done* on the ticket and report the run; a failed production run is reported at once and undone with a revert pull request.

The point is to measure how well intent predicts code, so record predictions honestly and never revise the Predicted Impact after approval; differences belong in Outcome.

### "process ZZF-NN"

Requests arrive as Linear tickets (team Zizify-team, project Feedback Collector, label `learn-mandalorian`, title `[learn-mandalorian] [<Type>] …`). When asked to **process** a ticket:

1. Read the ticket and write its change order as above, with the ticket identifier in the Ticket field, and commit it.
2. Paste the full change order into the conversation.
3. Post it as a comment on the ticket, with a link to the file on GitHub, and leave the ticket's own description untouched.
4. Ask any Decisions Needed in one round, then carry the change to dev without further stops. When the change order's status changes (approved, on dev, done), add a short comment to the ticket saying so.

### Navigation

| What you need | Where to look |
|---|---|
| High-level design | `docs/high-level-design.md` |
| User flow (narrative over the specs) | `docs/user-flow.md` |
| How the app was built (timeline, usage, decisions) | `docs/development-log.md` |
| Change orders (one per change, predicted vs actual) | `docs/change-orders/` |
| Low-level designs | `docs/intent/<node>/<node>-design.md` |
| EARS specs | `docs/intent/<node>/<node>-specs.md` |
| Decision docs (created when the first is written) | `docs/decisions/` (project-level) and `docs/intent/<node>/decisions/` |

Nodes: `reader` (READ), `progression` (PROG), `quiz` (QUIZ), `alphabet` (ALPHA), `content` (TEXT), `persistence` (PERS), `layout` (LAYOUT), `offline` (OFF), `feedback` (FEED), `intro` (INTRO), `help` (HELP), `analytics` (ANA).

### Terminology

- **HLD**: High-Level Design.
- **LLD**: Low-Level Design. One per intent component; frontmatter `parent:` and `prefix:`.
- **EARS**: structured one-line requirements with globally unique IDs. Markers: `[x]` implemented, `[ ]` active gap, `[D]` deferred.

### Code annotations

Code and tests carry `@spec` comments citing EARS IDs:

```typescript
// @spec READ-001, READ-006
export function renderPassage(...) { /* ... */ }
```

Place the annotation at the entry point of the behavior's implementation graph, not every helper.

## Commands

| Task | Command |
|---|---|
| Run locally | `npm run dev` |
| Unit tests (Vitest, jsdom) | `npm test` |
| Browser tests (Playwright: WebKit at iPhone, iPad, laptop; Chromium for offline) | `npm run test:e2e` |
| Typecheck | `npm run typecheck` |
| Deploy | Automatic: a pushed branch → dev (`learn-mandalorian-dev.andreizimin.com`); a merge into `main` → production (`learn-mandalorian.andreizimin.com`) |
| Live-site check against a deployed address | `LIVE_URL=https://… LIVE_STAGE=dev npm run test:live` (needs the matching build in `dist/`) |
| Fallback deploy from a laptop, only if GitHub Actions is unavailable | `npm run deploy:dev`; `npm run deploy:prod` (from `main` only) |
| Regenerate bundled passages | `python3 -I scripts/build_passages.py <gutenberg-dir> src/content/bundled` |
| Regenerate icons | `python3 -I scripts/build_icons.py public/fonts/mando-af-regular.woff2 public/icons` |

Layout and pagination specs are verified by the browser tests; jsdom has no layout engine.
