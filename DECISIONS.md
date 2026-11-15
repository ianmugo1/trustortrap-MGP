# DECISIONS.md

Every decision, newest last. Times are Europe/Dublin.

| When | Decision | Why |
|---|---|---|
| 2026-11-15 22:18 | Upgrade follows option C: polish and content everywhere, plus one new mode (red flag hunt). | Dylan's pick. Premium feel needs the polish, interactivity needs a new mechanic. |
| 2026-11-15 22:30 | Work goes on branch `immersive-upgrade` and merges by pull request. | `main` deploys to Vercel. |
| 2026-11-15 22:30 | Add the `motion` library. | Exit transitions and number count-ups are impractical in plain CSS. |
| 2026-11-15 22:30 | No sound effects. No new AI-image items for the social game. | Both need assets that do not exist yet. |
| 2026-11-15 22:38 | Skip the mockup sign-off step and build straight into the app. | Dylan's instruction. |
| 2026-11-15 22:45 | Seed scripts upsert and never delete. Phishing matches on question text, social on `order`. | The old seeds wiped every record first, which would remove questions added by hand in the live database. |
| 2026-11-15 22:45 | Phishing quiz serves 10 random questions per run instead of every question. | With 30 questions a full run would take too long. |
| 2026-11-15 22:45 | Red flag hunt content lives in `server/data/`, not MongoDB. | Ships with the deploy, no seed step. |
| 2026-11-15 22:50 | Hunt scoring: +10 per flag found, -5 per safe segment tapped, minimum 0 per email, 10 for leaving a real email alone. | Rewards care, and makes tapping everything a losing plan. |
| 2026-11-15 22:50 | Hunt reveals flags after "I'm done", not on each tap. The spec said on each tap. | Marking on each tap would need the answers in the browser or a server call per tap. |
| 2026-11-15 22:55 | Cyber Pet content added to `cyberPetMiniGames.js` (45 to 90 questions). `cyberPetQuestions.js` and `passwordIncidents.js` left alone. | Those two files are not imported anywhere. The spec's counts for them were wrong. |
| 2026-11-15 23:00 | Fonts are Sora and Inter from `@fontsource-variable`, not `next/font/google`. | Self-hosted files build without a network call to Google. |
| 2026-11-15 23:00 | Phishing quiz waits for a "Next question" tap instead of moving on after 1.2 seconds. | Players need time to read the explanation. |
| 2026-11-15 23:05 | Topbar shows level, XP bar and coins. The streak flame is in the phishing quiz only. | The daily streak comes from the pet API, which the topbar does not load. |
| 2026-11-15 22:56 | Switch the whole app to a bright, light theme. | Dylan asked for a brighter look for younger children. |
| 2026-11-15 23:10 | The bright theme is done by swapping Tailwind's colour variables in `client/src/app/bright-theme.css`, not by rewriting classes. `.tt-bright` on `<body>` turns it on, `.tt-original` turns it off for the stories pages. | The app has about 1,200 dark-theme colour classes. Swapping the variables changes all of them in one file and is easy to undo. |
| 2026-11-15 23:10 | Primary buttons are violet to pink with a chunky pressed-down shadow. | Reads as playful and gives a clear press response on touch screens. |
| 2026-11-15 23:20 | Phishing submit accepts answer `0`. | Option A is index 0 and the old check treated it as missing, so picking A always failed with a 400. |
| 2026-11-15 23:20 | Seeds connect with `dbName: "trustortrap"`. | The API always uses that database name. Without it the seeds could write to a different database than the API reads. |
| 2026-11-15 23:20 | `/api/users/me` converts mastery sub-documents to plain objects. | Spreading the Mongoose sub-documents returned zeros for every topic. |
| 2026-11-15 23:15 | Bright theme removed. Back to the dark theme. Animations, social game work and bug fixes stay. `bright-theme.css` deleted; it is in git history at commit `40715d9`. | Dylan asked to go back to the original theme. |
