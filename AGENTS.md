# AGENTS.md

Rules for any AI agent or new contributor working in this repo.

## Where code lives

| Path | What it holds |
|---|---|
| `client/src/app/` | Next.js pages. One folder per route. |
| `client/src/components/` | Shared UI. `motion/index.jsx` holds every shared animation piece. |
| `client/src/lib/` | Client helpers: API calls, XP maths, story chapters, shop data. |
| `client/src/app/globals.css` | Colour, surface and motion tokens (`.tt-card`, `.tt-btn`, `.tt-aurora`). |
| `server/routes/` | Express routes. Every game route needs the auth middleware. |
| `server/lib/` | Pure logic with tests (`hunt.js`, `xp.js`, `progress.js`). |
| `server/data/` | Game content kept in code: red flag emails, Cyber Pet questions, phishing questions. |
| `server/seed/` | Scripts that load content into MongoDB. |
| `server/test/` | `node:test` tests. Run with `npm --prefix server test`. |
| `docs/` | Design spec and tickets. |

## Agents may

- Add content to files in `server/data/`.
- Add screens and components that use the existing motion pieces and style tokens.
- Add tests.

## Agents may not

- Commit to `main`. Work on a branch and open a pull request.
- Run seed scripts against the live database. Dylan or Ian does that.
- Add `deleteMany` to a seed script. Seeds only add or update.
- Send answers to the browser before the player has answered. Scores are checked on the server.
- Add an animation that blocks the next tap for more than 400 ms, or one that ignores reduced motion.
- Change auth, shop prices or XP thresholds without a decision logged in `DECISIONS.md`.
- Commit `.env` files or secrets.

## Before you finish

1. `npm --prefix server test`
2. `npm --prefix client run build`
3. Add a line to `DECISIONS.md` for every choice a reviewer would ask about.
4. Update the ticket status in `docs/tickets/`.
