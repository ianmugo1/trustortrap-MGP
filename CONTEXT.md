# CONTEXT.md

## What the app does

TrustOrTrap teaches cyber safety through short games instead of long explanations. A player signs up, plays, earns coins and XP, levels up, and spends coins on cosmetics for a robot pet called Byte.

## Who it is for

Beginners, mainly children and teenagers aged about 10 to 16, plus anyone new to online safety. Copy is written for a reading age of 10 to 12.

## How it works

| Part | What happens |
|---|---|
| Phishing quiz | 10 multiple choice questions per run, drawn at random from the database. Each answer is checked on the server and comes with an explanation. |
| Red flag hunt | 5 emails per run from a pool of 15. The player taps the parts that look wrong. The server marks each email and scores the run. One email per run is real. |
| Social media safety | Three acts: spot the AI image, spot the bot comments, fix the privacy settings. |
| Cyber Pet | Daily mini-games (true or false, password strength, fill the blank). Right answers raise Byte's health and mood. |
| Stories | Six short chapters that explain one danger each, then link to the matching game. |
| Progress | XP and levels, coins, mastery per topic, a leaderboard and a daily streak. |
| Shop | Coins buy pet skins, rooms and badges. |

## Stack

- `client/`: Next.js 16, React 19, Tailwind 4, `motion` for animation. Deployed on Vercel.
- `server/`: Express and MongoDB (Mongoose), JWT auth. Deployed on Vercel as serverless functions.
- An iOS build using Capacitor lives on the `ios-app` branch.

## Content sources

- In code, live as soon as it deploys: `server/data/redFlagEmails.js`, `server/data/cyberPetMiniGames.js`, `client/src/lib/storyChapters.js`.
- In MongoDB, needs a seed run: phishing quiz questions (`npm --prefix server run seed:phishing`) and social game content (`npm --prefix server run seed:social`).
