# Script Ramp (mandalorian-alphabet)

## LID
- Mode: Full
- Version: 1.3.0

## Linked-Intent Development (MANDATORY)

**Consult the `linked-intent-dev` skill for ALL code changes.** All changes flow through the arrow of intent in one direction:

```
HLD → LLDs → EARS → Tests → Code
```

The skill guides the agent through HLD check → LLD check → EARS → intent-narrowing edge audit → tests-first → code, with stops between each phase. When specs and code disagree, specs win: fix the code, or fix the spec and cascade.

## Change Orders (MANDATORY)

**Every change — feature, bug or minor fix — starts with a change order, before any design doc, spec, test or code is touched.**

0. Work on a branch: every change order gets its own branch, named after its ticket (for example `zzf-62-dev-environment`), created before any change.
1. Copy `docs/change-orders/TEMPLATE.md` to `docs/change-orders/CO-NNN-short-slug.md` (next unused number) and fill in the predicted impact at every level of the arrow, cross-segment effects, decisions needed, risks and verification. Status: *Proposed*. Add its row to the index in `docs/change-orders/README.md`.
2. Stop and present it. Work begins only after the requester approves it (status *Approved*).
3. Walk the LID arrow as predicted. If the work departs from the prediction, update the change order as it happens.
4. Open a pull request into `main` linking the change order; CI (`.github/workflows/ci.yml`) runs the typecheck, unit tests and browser tests. Deploy the branch to dev (`npm run deploy:dev`) and ask the requester to check it at `learn-mandalorian-dev.andreizimin.com`.
5. Merge the pull request only on the requester's go; deploy production (`npm run deploy:prod`) from `main`, again on their go.
6. When done, fill in the Outcome section (predicted vs actual per level, surprises, commits, measurements), set status *Done*, and update the index row.

The point is to measure how well intent predicts code, so record predictions honestly and never revise the Predicted Impact after approval; differences belong in Outcome.

### "process ZZF-NN"

Requests arrive as Linear tickets (team Zizify-team, project Feedback Collector, label `learn-mandalorian`, title `[learn-mandalorian] [<Type>] …`). When asked to **process** a ticket:

1. Read the ticket and write its change order as above, with the ticket identifier in the Ticket field, and commit it.
2. Paste the full change order into the conversation.
3. Post it as a comment on the ticket, with a link to the file on GitHub, and leave the ticket's own description untouched.
4. Stop for approval. When the change order's status changes (approved, done), add a short comment to the ticket saying so.

### Navigation

| What you need | Where to look |
|---|---|
| High-level design | `docs/high-level-design.md` |
| User flow (narrative over the specs) | `docs/user-flow.md` |
| How the app was built (timeline, usage, decisions) | `docs/development-log.md` |
| Change orders (one per change, predicted vs actual) | `docs/change-orders/` |
| Low-level designs | `docs/intent/<node>/<node>-design.md` |
| EARS specs | `docs/intent/<node>/<node>-specs.md` |

Nodes: `reader` (READ), `progression` (PROG), `quiz` (QUIZ), `alphabet` (ALPHA), `content` (TEXT), `persistence` (PERS), `layout` (LAYOUT), `offline` (OFF), `feedback` (FEED).

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
| Deploy the current branch to dev (`learn-mandalorian-dev.andreizimin.com`) | `npm run deploy:dev` |
| Deploy production (`learn-mandalorian.andreizimin.com`), from `main` only | `npm run deploy:prod` |
| Regenerate bundled passages | `python3 -I scripts/build_passages.py <gutenberg-dir> src/content/bundled` |
| Regenerate icons | `python3 -I scripts/build_icons.py public/fonts/mando-af-regular.woff2 public/icons` |

Layout and pagination specs are verified by the browser tests; jsdom has no layout engine.
