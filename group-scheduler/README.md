# Group Scheduler

A When2Meet-style group scheduler. An organizer creates an event with a title
and a set of candidate calendar days, gets a shareable link, and participants
open the link, enter their name, and mark each day as **Available**, **If
Needed**, or **Not Available**. The app highlights the day(s) that work best
for the group.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

Unit and component tests (Vitest + React Testing Library):

```bash
npm test          # run once
npm run test:watch
```

These cover the pure logic in `src/lib` (best-day ranking, id generation,
the in-memory store), the API route handlers, and the components under
`src/components`. They live in `tests/unit/`, mirroring the `src/` layout.

End-to-end tests (Playwright, drives a real browser against the dev server):

```bash
npm run test:e2e
```

`tests/e2e/golden-path.spec.ts` walks the full flow: create an event, two
participants mark availability, results highlight the best day, and a
reload re-identifies a returning participant instead of duplicating them.
Playwright starts/stops `npm run dev` for you (see `playwright.config.ts`).

Note: `npm test`/`test:watch` set `NODE_OPTIONS=--no-experimental-webstorage`
— newer Node versions ship their own global `localStorage` stub that
otherwise shadows jsdom's working implementation in tests.

## Known limitations (prototype scope)

- **In-memory storage only — no database.** All events and participant
  responses live in the Node process's memory (`src/lib/store.ts`) and are
  lost on restart. This only works correctly as a **single long-lived Node
  process** (`next dev`, or one `next start` instance). It will **not** work
  on serverless/multi-instance deployments (e.g. default Vercel functions),
  since there's no shared process memory across invocations. Swapping in a
  real datastore (SQLite, Postgres, etc.) is the natural next step if this
  needs to survive restarts or scale beyond one process.
- **No accounts or authentication.** Anyone with the link can create an event
  or submit availability as any name. There's no rate limiting or abuse
  protection.
- **No event editing/deletion**, and no cross-tab/cross-device conflict
  resolution beyond last-save-wins.
- **Day granularity only** — no time-of-day scheduling.
- **No live updates** — results refresh on save or page reload, not via
  polling/WebSockets.
