# Learn Mandalorian

**Live:** [learn-mandalorian.andreizimin.com](https://learn-mandalorian.andreizimin.com)

Learn to read the Mandalorian alphabet by reading real stories. You read an English book while its letters turn into Mandalorian glyphs one at a time, starting with the most common (E, T, A, O…), so each new glyph is decoded from context hundreds of times. A quick quiz checks what reading has taught, and the app suggests the next letter when you're ready.

- Three bundled public-domain books (*The Call of the Wild*, *Treasure Island*, *The War of the Worlds*), or paste any English text.
- Tap a glyph to peek at its English letter.
- 10-question quizzes on letters and short words, with Star Wars vocabulary as answers once you know the letters.
- Works offline and installs to the iPhone or iPad Home Screen. All progress stays on the device, with export and import to move it.

## How It Was Built

The app was built in one session by a human directing an AI coding agent (Claude Code), following [Linked-Intent Development](https://github.com/jszmajda/lid): every change flows from design docs to numbered requirements to tests to code, with a human review stop between each.

| | |
|---|---|
| High-level design | [docs/high-level-design.md](docs/high-level-design.md) |
| Component designs and requirements | [docs/intent/](docs/intent/) (8 components, 89 requirements) |
| User journey | [docs/user-flow.md](docs/user-flow.md) |
| How the build went: timeline, usage, decisions, mistakes | [docs/development-log.md](docs/development-log.md) |

Every test and source file carries `@spec` tags naming the requirements it covers.

## Running It

Requires Node 20 or later.

```sh
npm install
npm run dev          # local dev server
npm test             # unit tests (Vitest)
npm run test:e2e     # browser tests (Playwright: Safari's engine at iPhone, iPad and laptop sizes; Chromium for offline)
npm run typecheck
```

Browser tests need the browsers once: `npx playwright install webkit chromium`.

Deploys use [SST](https://sst.dev) to AWS (`npm run deploy` for a throwaway stage, `npm run deploy:prod` for the live domain) and need AWS credentials.

## Stack

React, TypeScript and Vite; `vite-plugin-pwa` for offline support; Vitest and Testing Library for unit tests; Playwright for browser tests; SST `StaticSite` on AWS (S3 and CloudFront) for hosting.

## Credits and Licenses

- **Code:** MIT, see [LICENSE](LICENSE).
- **Font:** Mando AF Regular by [AurekFonts](https://github.com/AurekFonts/AurekFonts.github.io), CC0 (public domain). See [public/fonts/README.md](public/fonts/README.md).
- **Books:** public domain, from [Project Gutenberg](https://www.gutenberg.org). See [src/content/bundled/README.md](src/content/bundled/README.md).
- This is a non-commercial fan learning project, not affiliated with or endorsed by Lucasfilm or Disney. Star Wars and The Mandalorian are trademarks of Lucasfilm Ltd.
