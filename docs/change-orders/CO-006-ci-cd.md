# CO-006: CI/CD with one manual step

| | |
|---|---|
| Type | Feature |
| Status | Done |
| Requested | 2026-10-12 |
| Approved | 2026-10-12 |
| Completed | 2026-10-12 |
| Ticket | [ZZF-66](https://linear.app/zizify-workshop/issue/ZZF-66) |

## Request

"before we go with CO-005, I need a CI/CD that would work without all the stop and go and manual steps. It needs only 1 manual step - when you tell me that the thing is in dev and I can check it. I check it and give a go - then it all goes to prod."

## Intent

A change needs the requester exactly once: when it is live on dev, they check it and say go. Everything else runs without waiting on them. The pipeline tests every push and deploys passing branches to dev. A go merges the change, and the merge deploys it to production. Each deploy is checked against the live site, not only a local build.

## Findings That Shape the Plan

- **Today's flow has five or six stops:**
  - approving the change order
  - a go for the dev deploy
  - the merge
  - a go for the production deploy
  - a separate pull request for the change order's Outcome
  - for CO-004, a second pull request when a merge raced a push

  Deploys run from the developer's laptop.
- **The account is already set up for this.** AWS already trusts GitHub Actions (an OIDC provider in account 341430680873). Each personal project deploys through its own role, `gha-deploy-<repo>`, which trusts only that repository's named GitHub environments, so no long-lived keys exist. feedback-platform's `deploy-prod.yml` deploys production on every merge to `main`.
- **The live check matters.** CO-004 found that offline had never worked in production, although every test passed against a local server. The pipeline should repeat that live check automatically after every deploy.
- **The Outcome can be written before the merge.** Predicted vs actual, surprises and measurements are all known once the work is on dev. Only "deployed to production" comes later, and the pipeline's run records it. So no closing pull request is needed.

## Predicted Impact

### HLD

- System Design, "Change flow": rewritten for the pipeline (push → tests → dev → the requester's check → merge → production), naming the one manual step.

### LLDs

| Component | Section | Change |
|---|---|---|
| `offline` | Hosting | A "Deploy pipeline" subsection: which push deploys where; the GitHub environments and AWS role; the live check after each deploy; one deploy per stage at a time |
| `offline` | Verification | The live check after every deploy, alongside the browser tests |
| `offline` | Decisions & Alternatives | Rows for deploying from GitHub Actions (vs the laptop) and for deploying production on merge (vs an approval button) |

### Specs

| ID | Action | Text (new or revised) |
|---|---|---|
| `OFF-011` | Add | When a branch other than `main` is pushed and its typecheck, unit tests and browser tests pass, the pipeline SHALL deploy it to the `dev` stage and then check the live dev site. |
| `OFF-012` | Add | When `main` changes and its tests pass, the pipeline SHALL deploy it to the `production` stage and then check the live production site. |
| `OFF-013` | Add | The live-site check SHALL fail the pipeline unless every file of the build is served, the service worker, manifest and `index.html` are served `no-cache`, the stage's names and indexing rules (OFF-007, OFF-008) hold, and the app opens with no network after its first visit. |

Net: +3 new, 0 revised, 0 deleted. (OFF-009 and OFF-010 are left for CO-005, which proposes them.)

### Tests

| File | Action | Specs covered |
|---|---|---|
| `e2e/live.spec.ts` | Add | `OFF-013`: run against a deployed address, never in the normal browser test run |
| `playwright.config.ts` | Change | A `live` project pointed at the deployed address, excluded from `npm run test:e2e` |

The pipeline itself (OFF-011, OFF-012) is verified by its first runs on this branch and on `main`, not by unit tests.

### Code

| File | Action | What changes |
|---|---|---|
| `.github/workflows/ci.yml` | Change | Becomes the pipeline: a test job on every push; a dev deploy job plus live check on branches; a production deploy job plus live check on `main` |
| `package.json` | Change | `test:live` script for the live-site check |

### Other

- **AWS (one-time, needs your approval with this change order):** a new role, `gha-deploy-mandalorian-alphabet`, trusting this repository's `dev` and `production` environments. Its permissions are decision 3.
- **GitHub (one-time):**
  - environments `dev` (any branch) and `production` (`main` only)
  - a repository variable `AWS_ROLE_ARN`
- **`CLAUDE.md`:** Change Orders steps rewritten to the one-check flow; the Commands table marks the local deploy scripts as a fallback.
- **Memory:** deployment and process notes updated to the new flow.
- **Development log:** no change until the outcome.

## Cross-Segment Effects

- **All segments, through process only:** every later change order follows the new flow. No component's behavior changes.
- **CO-005:** waits for this one; its branch is rebased onto `main` afterwards and becomes the first change to use the pipeline end to end.

## Decisions Needed

1. **Which stops remain.**
   - *Recommended:* only the dev check. I write the change order and carry it through tests and code to dev without stopping. You read the change order and check the dev site together, then say go. If a change order has questions only you can answer, I ask them all at the start, in one round, before working.
   - *Alternative:* two stops: approving the change order, then the dev check.
2. **What a go triggers.**
   - *Recommended:* I merge the pull request, and the merge deploys production automatically, followed by the live check. I report the result on the ticket and close it.
   - *Alternative:* the merge waits on an "Approve deployment" button in GitHub. That's safer, but it's a second manual step.
3. **The deploy role's permissions.**
   - *Recommended:* AdministratorAccess, scoped to this repository's two environments, like the other `gha-deploy-*` roles. SST needs S3, CloudFront, certificates, DNS, IAM and its own state bucket.
   - *Alternative:* a hand-scoped policy. It's tighter, but it breaks whenever SST needs a new permission.
4. **Infrastructure changes.** feedback-platform skips its automatic deploy when `sst.config.ts` or workflows change.
   - *Recommended:* no such skip here. Infrastructure changes deploy to dev first through the same code and are checked there, so a skip would only add a manual step.
   - *Alternative:* the same skip as feedback-platform, with infrastructure changes deployed by a manual run.

## Risks and Edge Cases

- **A bad production deploy:** the live check fails the run and I report it. Recovery is a revert pull request, which deploys the previous version through the same pipeline.
- **Two branches at once:** dev is one stage, so the last branch pushed is what dev shows. Deploys to the same stage queue rather than overlap. One change order at a time keeps this simple.
- **Merging before the dev run finishes** (as happened with CO-004): the go always refers to a specific commit that I've reported as live on dev. If the branch has moved since, I say so and the check starts over.
- **The live check on GitHub's machines:** it uses Chromium for the offline part, as the local browser tests do. iPhone behavior is still checked by the requester on dev.
- **Fallback:** `npm run deploy:dev` and `npm run deploy:prod` still work from the laptop if GitHub Actions is down.
- **This change's own rollout:** the pipeline can't deploy itself before it exists. Its first dev deploy runs once the role and environments are set up, and the first production deploy happens when this change order merges.

## Verification

- The live-site check passes against today's production site, before any pipeline change.
- On this branch: a push runs the tests, deploys to dev and passes the live check, with no command from my laptop.
- The requester checks dev (the site is unchanged; the run is the proof) and says go.
- The merge deploys production and the live check passes there.
- CO-005 then goes through the new flow end to end as its first real use.

---

## Outcome

Written before the requester's dev check, as the new flow requires; the production run is reported on the ticket.

### Predicted vs Actual

| Level | Predicted | Actual | Notes |
|---|---|---|---|
| HLD | "Change flow" rewritten | As predicted | |
| LLDs | 3 changes in `offline` | 3: Deploy pipeline subsection, Verification, 2 decision rows | As predicted |
| Specs | +3 | +3 (OFF-011, OFF-012, OFF-013) | As predicted |
| Tests | `e2e/live.spec.ts`, `playwright.config.ts` | Those, plus `e2e/helpers.ts` and `e2e/layout.spec.ts` | Two existing browser tests had a race the pipeline exposed (surprise 3) |
| Code | `ci.yml`, `package.json` | As predicted | |
| Other | AWS role, GitHub environments and variable, `CLAUDE.md`, memory | As predicted | The role's trust condition needed the repository's immutable IDs (surprise 2) |

### Surprises

1. **A missing file doesn't return an error.** The first draft of the live check compared status codes only. To test the check, I ran it against a build with an extra file the site lacked, and it still passed: for a missing file at the top level, the site's router answers 200 with the app's page. (Under `assets/` it answers 403.) The check now compares every served file with the build, byte for byte. Without that negative test, the check would have missed exactly the CO-004 bug it exists to catch.
2. **GitHub identifies newer repositories by ID.** Copying the trust condition from feedback-platform (`repo:andreizimin/feedback-platform:…`) failed: this repository's OIDC subject uses immutable IDs (`repo:andreizimin@75641133/mandalorian-alphabet@1413777045:…`). The role now trusts that form, which also survives a rename.
3. **The pipeline's first runs exposed a race in two browser tests.** After a page turn, the "stopped peeking" hint can appear, shrink the reading area and re-cut the pages in place. The app keeps the saved position and shows the page that contains it (TEXT-004). The first word on screen then sits earlier than the saved position, and these tests took the on-screen word as the learner's word. My first fix (waiting longer) misread the cause and failed again. The tests now read the saved position. This is open for a later change order: TEXT-004 defines the position as "the first word of the page they were on", which an in-place re-cut makes ambiguous.
4. **Laptop and CI differ in timing, not only in fonts.** The race never showed locally in dozens of runs, and it failed on GitHub's runners twice in a row. Running every push on CI is what found it.
5. **Platform notices to watch:** GitHub will move `ubuntu-latest` to Ubuntu 26 from 2026-10-19, and the `actions/*@v4` steps run on a deprecated Node 20. Neither blocks the pipeline today.

### Commits

| Hash | Message |
|---|---|
| `59dc5c1` | CO-006 proposed: CI/CD with one manual step (ZZF-66) |
| `91b6257` | CO-006: deploy pipeline with a live-site check (ZZF-66) |
| `016decf` | CO-006: wait for pages to re-cut in the text-size browser test |
| `514f6a4` | CO-006: keep-the-word browser tests use the saved position |
| (this commit) | CO-006: outcome recorded before the dev check |

### Measurements

| | |
|---|---|
| Tests before → after | unit 266 → 266, browser 52 → 52, plus a 4-test live-site check run after every deploy |
| Lines changed | +72 −14 (pipeline: workflow, Playwright config, script), +107 −4 (tests, 3 files), +35 −10 (HLD, LLD, specs, `CLAUDE.md`) |
| Pipeline runs on the branch | 3 runs plus 1 rerun: 2 failed on the test race, 1 failed on the role's trust condition; the rerun passed (tests 2m41s, deploy and live check 1m08s) |
| Agent time | about 25 minutes from approval (17:47) to the outcome (18:12) |
| Deployed | dev from the branch by the pipeline (run 38330404997); production when the pull request merges |
