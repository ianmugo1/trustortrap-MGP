# Immersive upgrade: design

Date: 2026-11-15
Branch: `immersive-upgrade` (from `main`), delivered as one pull request.

## Intent

Dylan's words: the app does not have enough content, is not interactive enough, and needs to feel more premium. The goal is that a player gets more to do, does more than pick one of four options, and sees the app respond to every action.

## Goals

1. Every screen moves: page transitions, hover and tap response, animated answer feedback, reward moments.
2. One new way to play: red flag hunt, inside the phishing game.
3. More content in every game and two new story chapters.
4. A consistent premium look: one typeface pair, one set of surfaces, one motion language.

## Non-goals

- Inbox triage and scam chat modes. They become follow-up tickets.
- Merging the `ios-app` branch. This work must not block it (see constraints).
- Auth, shop pricing, XP thresholds, leaderboard logic. Unchanged.
- Sound effects.

## Anti-goals

- Motion that slows play. No animation may delay the next tap by more than 400 ms.
- Breaking the live Vercel deploy or wiping live database content.
- A heavier app. The client JS bundle may grow by 60 kB gzipped at most.

## Constraints

- Stack stays: Next.js 16, React 19, Tailwind 4, Express, MongoDB.
- Game scores are checked on the server. New modes follow that rule.
- `prefers-reduced-motion` is respected everywhere (the app already does this for the landing page).
- Kid-friendly tone, reading age about 10 to 12, same as existing copy.
- The app runs inside Capacitor on the `ios-app` branch: no hover-only interactions, tap targets at least 44 px.
- CI (`.github/workflows/ci.yml`) must pass.

## Approaches considered

- **A. Polish and fill.** Motion, typeface, content, same mechanics. Low risk, but players still only pick options.
- **B. New ways to play.** Inbox triage, red flag hunt, scam chat. Fixes interactivity, leaves old screens plain, needs the most server work.
- **C. A plus red flag hunt.** Picked by Dylan. Premium feel comes from A, interactivity from the cheapest B mode.

## Design

### 1. Motion system (Claude's call)

Add one dependency: `motion` (the Framer Motion package). CSS alone cannot do exit transitions or number count-ups without hand-written code on each screen.

Shared pieces in `client/src/components/motion/`:

| Piece | Does | Used on |
|---|---|---|
| `PageTransition` | fade and 12 px rise on route change | `AppFrame` |
| `Reveal` | staggered entrance for lists and card grids | dashboard, games hub, stories, leaderboard, shop |
| `PressableCard` | lift on hover, scale 0.98 on tap | every clickable card |
| `CountUp` | animates a number to its new value | XP, coins, scores, stat cards |
| `AnswerFeedback` | green pulse and tick on correct, red shake on wrong | phishing, social, Cyber Pet, red flag hunt |
| `Confetti` | canvas burst, about 1.2 s | level-up, perfect run, story chapter complete |
| `ProgressRing` / animated bar | fills smoothly | XP bar in topbar, run progress |

Durations: 150 to 250 ms for response, 400 ms cap for transitions. With reduced motion on, everything falls back to instant state changes.

### 2. Look (Claude's call)

- Typeface via `next/font`: Sora for headings, Inter for body. Replaces the system-font stack.
- Keep the dark slate base and the green/cyan/yellow accents already in `globals.css`. Add tokens for surface levels, radius, shadow and glow so cards stop defining their own.
- Replace the yellow and blue dot pattern in `AppFrame` with a slow aurora gradient.
- Sidebar: animated active indicator. Topbar: XP bar that fills, coin counter that counts up, streak flame that pulses when the streak is alive.

### 3. Screens

- **Landing:** keep the current hero. Add a scroll-revealed feature section and an animated mock email that flips between "trust" and "trap".
- **Dashboard:** stat cards count up, a "continue where you left off" card, daily goal ring.
- **Games hub:** larger cards with an animated icon per game, difficulty and time labels, a "new" badge on red flag hunt.
- **Phishing quiz:** card slides out and the next slides in, `AnswerFeedback`, combo counter for answers in a row, explanation shown after each answer, results screen with count-up score and confetti on a perfect run.
- **Social game and Cyber Pet:** same feedback and transitions. The pet gets idle, happy and sad states driven by health and the last answer, built with CSS on the existing pet art.
- **Stories:** panels reveal as you advance, progress dots, confetti on chapter end.
- **Leaderboard:** rows animate in, top three get a podium.
- **Shop:** item preview animates on select, purchase gives a coin count-down and a flash.
- **Login, register, settings:** restyled to the new tokens. No behaviour change.

### 4. Red flag hunt

A new mode at `/games/phishing/hunt`, linked from the games hub and the phishing start screen.

```
+--------------------------------------------------+
| Red flag hunt        Email 2 of 5    Flags 1 / 3 |
+--------------------------------------------------+
| From: [Netflix Support <help@netfl1x-billing.co>]|
| Subject: [Your account will be CLOSED today]     |
|                                                  |
| Dear Customer,                                   |
| We could not process your payment.               |
| [Update your details within 2 hours] or lose     |
| access. [http://netflix.account-verify.co/login] |
|                                                  |
| Thanks, the Netflix team                         |
+--------------------------------------------------+
| Tap anything that looks wrong.    [ I'm done ]   |
+--------------------------------------------------+
```

- Each email is a list of segments. Every segment is tappable. Some are flags, some are safe.
- Tapping a flag turns it green and opens a one-line reason. Tapping a safe segment turns it amber and costs a point.
- "I'm done" ends the email and reveals missed flags. One email in each run has no flags, and the right move is to tap nothing.
- A run is 5 emails drawn from a pool of 15.
- Data lives in `server/data/redFlagEmails.js`, the same pattern as the Cyber Pet questions. No database seed needed.
- Server: `GET /api/phishing/hunt` returns 5 emails with flag markers removed. `POST /api/phishing/hunt/complete` receives the tapped segment ids per email, scores them, and awards XP and coins through the existing `applyXpReward` and mastery helpers. Reward size matches a phishing quiz run.

### 5. Content

| Area | Now | After | Needs database seed |
|---|---|---|---|
| Phishing quiz questions | 6 in seed | 30, each with an explanation and difficulty | Yes |
| Red flag hunt emails | 0 | 15 | No |
| Cyber Pet questions | about 30 | 60 | No |
| Password incidents | 16 | 30 | No |
| Social scenarios (comments, privacy) | about 30 items | about 50, text-based only | Yes |
| Story chapters | 4 | 6 (new: "The Too-Good Job Offer", "The Wi-Fi Trap") | No |

AI-image items in the social game are not expanded, because they need image assets.

### 6. Seed safety

`server/seed/phishingQuestions.js` and `seedSocial.js` delete every existing record before inserting. The live database may hold questions that are not in the seed files (the route supports an older `correct` text format that the seed never writes). Both seeds change to upsert by question text, with no deletes. Running them is still a manual step for Dylan or Ian: `npm --prefix server run seed:phishing` and `seed:social`.

### 7. Repo housekeeping (Dylan's standing workflow)

- Add `AGENTS.md`, `CONTEXT.md` and `DECISIONS.md` at the repo root. Each decision in this document goes into `DECISIONS.md` with a timestamp.
- Work is split into small ordered tickets with steps and acceptance criteria, kept in `docs/tickets/`, each with a status line.
- Ticket 1 is a clickable mockup of the restyled dashboard, the phishing answer feedback and red flag hunt, for Dylan's sign-off before product code.

## Verification

- `npm --prefix client run build` passes.
- Server tests for hunt scoring: all flags found, a safe segment tapped, the no-flag email, tampered segment ids.
- Each screen checked in a browser at 390 px and 1280 px, with reduced motion on and off.
- Bundle size compared before and after.

## Left to the builder

- Exact easing curves and stagger timings.
- Wording of new questions, emails and chapters, within the tone constraint.
- Podium and pet-state visuals.
