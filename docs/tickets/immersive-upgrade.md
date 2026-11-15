# Immersive upgrade: tickets

Spec: `docs/superpowers/specs/2026-11-15-immersive-upgrade-design.md`
Branch: `immersive-upgrade`

Status values: `todo`, `in progress`, `done`, `blocked`. Update the status line when a ticket changes.

## Global rules

- Stack stays Next.js 16, React 19, Tailwind 4, Express, MongoDB. One new client dependency: `motion`.
- No animation delays the next tap by more than 400 ms. Respect `prefers-reduced-motion`.
- Tap targets at least 44 px. No hover-only interactions.
- Game scores are checked on the server.
- Client JS grows by 60 kB gzipped at most.
- Copy is kid-friendly, reading age 10 to 12.

## Review focus

Inputs the spec implies that are likely to bite:

1. Hunt submit with segment ids that do not exist, or email ids not in the pool: ignored, never crash, never score.
2. Hunt submit with the same flag id repeated: counted once.
3. Hunt submit with an empty body: scores zero, still returns success.
4. Seed run twice: no duplicates, no deletes.
5. Reduced motion on: every screen still usable, no content hidden behind an animation.

---

## T1. Repo docs
Status: done

Steps: add `AGENTS.md`, `CONTEXT.md`, `DECISIONS.md` at the repo root.
Accept: each file exists; `DECISIONS.md` holds every decision from the spec with a timestamp.

## T2. Red flag hunt: data and scoring
Status: done

Files: `server/data/redFlagEmails.js`, `server/lib/hunt.js`, `server/test/hunt.test.js`, `server/package.json` (`test` script).

Interfaces produced:
- `redFlagEmails`: array of `{ id, from, subject, segments: [{ id, text, flag, reason }] }`. `flag` is a boolean. 15 emails, at least 3 with no flags.
- `pickHuntEmails(count = 5, rng = Math.random)`: returns `count` emails, at least one with no flags.
- `toPublicEmail(email)`: same shape without `flag` and `reason`.
- `scoreHunt(submissions)`: `submissions` is `[{ emailId, tapped: [segmentId] }]`. Returns `{ score, maxScore, flagsFound, flagsTotal, wrongTaps, perfect, emails: [{ emailId, found, missed, wrong, segments }] }`.

Scoring: 10 points per flag found, minus 5 per safe segment tapped, minimum 0 per email. A no-flag email is worth 10 when nothing is tapped.

Steps: write the tests, watch them fail, write the code, watch them pass.
Accept: `npm --prefix server test` passes, covering review focus 1 to 3.

## T3. Red flag hunt: routes
Status: done

Files: `server/routes/phishingGame.js`.

- `GET /api/phishing/hunt` returns `{ success, emails }` using `pickHuntEmails` and `toPublicEmail`.
- `POST /api/phishing/hunt/complete` with `{ submissions }` scores with `scoreHunt`, adds 20 coins, awards 25 XP when score is at least half of max and 15 otherwise, records mastery under `phishing`, returns the score breakdown with `xpAwarded`, `completionBonus`, `leveledUp`, `level`, `totalXp`, `totalCoins`.

Accept: both routes need auth; the GET response contains no `flag` or `reason` field.

## T4. Safe seeds and phishing questions
Status: done

Files: `server/seed/phishingQuestions.js`, `server/seed/seedSocial.js`, `server/data/phishingQuestions.js`.

Steps: move questions to `server/data/phishingQuestions.js` and grow to 30, each with `explanation`, `difficulty`, `category`. Change both seeds to upsert by text with no deletes.
Accept: no `deleteMany` in `server/seed/`; a test asserts 30 questions, 4 options each, valid `correctOption`, non-empty `explanation`.

## T5. Mockup for sign-off
Status: dropped. Dylan asked to build straight into the app (2026-11-15 22:38)

One HTML page showing the restyled dashboard, phishing answer feedback and red flag hunt. No product code depends on it.
Accept: Dylan approves the look or lists changes.

## T6. Motion kit and look
Status: done. Fonts come from `@fontsource-variable`. Topbar has level, XP bar and coins, no streak flame

Files: `client/src/components/motion/*`, `client/src/app/globals.css`, `client/src/app/layout.js`, `client/src/components/AppFrame.jsx`, `Sidebar.js`, `Topbar.js`.

Steps: install `motion`; add Sora and Inter through `next/font`; add surface, radius, shadow and glow tokens; build `PageTransition`, `Reveal`, `PressableCard`, `CountUp`, `AnswerFeedback`, `Confetti`, `ProgressRing`; aurora background; animated sidebar indicator; topbar XP bar, coin count-up, streak flame.
Accept: client build passes; with reduced motion on, state changes are instant.

## T7. Red flag hunt screen
Status: done. Flags are revealed after "I'm done" through `POST /api/phishing/hunt/check`

Files: `client/src/app/games/phishing/hunt/page.jsx`, link from `client/src/app/games/page.js` and the phishing start screen.
Accept: a full run of 5 emails can be played at 390 px wide; results show found, missed and wrong taps from the server response.

## T8. Phishing quiz, social game, Cyber Pet
Status: done. Phishing quiz, Cyber Pet and all three social acts animate

Steps: card transitions, `AnswerFeedback`, combo counter, explanation after each answer, count-up results, confetti on a perfect run, pet idle/happy/sad states.
Accept: each game plays start to finish with no behaviour change to scoring.

## T9. Dashboard, games hub, stories, leaderboard, shop, landing
Status: done except landing. Dashboard, games hub, stories, leaderboard (with podium) and shop done. Landing has the bright theme only, no new sections

Accept: each screen matches the spec section "Screens" at 390 px and 1280 px.

## T10. Login, register, settings restyle
Status: done through the bright theme and shared styles. No layout changes

Accept: new tokens applied, no behaviour change.

## T11. Remaining content
Status: done, to the corrected counts in the spec. Cyber Pet 45 to 90, social scenarios 5 to 8, settings 7 to 11, stories 4 to 6

Cyber Pet questions 30 to 60, password incidents 16 to 30, social text scenarios to about 50, two story chapters ("The Too-Good Job Offer", "The Wi-Fi Trap") with their page files.
Accept: counts match the spec table; new chapters appear on the stories page.

## T12. Verify and ship
Status: in progress. Server tests and client build pass. Every screen opened at 1280 px and 390 px against the real API and a real MongoDB, plus a reduced-motion pass at 1280 px. Not done: bundle size comparison, Cyber Pet mini-game played to the end, shop purchase, check inside the iOS build

Steps: client build, server tests, browser check of every screen at both widths with reduced motion on and off, bundle size before and after, mark the pull request ready.
Accept: CI green; bundle growth at most 60 kB gzipped.

## T13. Bright theme for younger children
Status: reverted on 2026-11-15 23:15 at Dylan's request. Dark theme restored

Files: `client/src/app/bright-theme.css`, `client/src/app/globals.css`, `client/src/app/layout.js`, stories pages (`tt-original`).
Accept: every screen has a light background with readable text; stories pages keep their own colours.

## T14. Bug fixes found while testing against a real database
Status: done

- Phishing submit rejected option A (index 0).
- Seeds did not set the database name the API uses.
- `/api/users/me` returned zeros for mastery.
