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

### Navigation

| What you need | Where to look |
|---|---|
| High-level design | `docs/high-level-design.md` |
| User flow (narrative over the specs) | `docs/user-flow.md` |
| Low-level designs | `docs/intent/<node>/<node>-design.md` |
| EARS specs | `docs/intent/<node>/<node>-specs.md` |

Nodes: `reader` (READ), `progression` (PROG), `quiz` (QUIZ), `alphabet` (ALPHA), `content` (TEXT), `persistence` (PERS), `layout` (LAYOUT), `offline` (OFF).

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
| Deploy a throwaway stage | `npm run deploy` |
| Deploy production (`learn-mandalorian.andreizimin.com`) | `npm run deploy:prod` |
| Regenerate bundled passages | `python3 -I scripts/build_passages.py <gutenberg-dir> src/content/bundled` |
| Regenerate icons | `python3 -I scripts/build_icons.py public/fonts/mando-af-regular.woff2 public/icons` |

Layout and pagination specs are verified by the browser tests; jsdom has no layout engine.
