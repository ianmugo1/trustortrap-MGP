 # TrustOrTrap

  TrustOrTrap is a beginner-friendly cyber safety training app
  that helps people build better online habits through short,
  game-style challenges.

  Instead of reading long security guides, users learn by doing:
  - Spotting phishing scams
  - Practicing safer online decisions
  - Taking daily Cyber Pet challenges that reward consistent
  learning

  ## Why This Project Exists
  Most people know cyber threats are real, but learning
  cybersecurity can feel technical and overwhelming.
  TrustOrTrap makes it practical and engaging with quick,
  interactive tasks that mirror real-world situations.

  ## What You Can Do in TrustOrTrap
  - Create an account and log in securely
  - Play a phishing awareness game
  - Track your progress in a dashboard
  - Complete a daily Cyber Pet challenge:
  - 5 short cybersecurity questions per day
  - Correct answers improve pet health
  - Wrong answers reduce pet health
  - New question set each day

  ## Cyber Pet Mode (Simple + Daily)
  Cyber Pet is designed as a lightweight daily habit:
  - Pet starts below full health (to encourage play)
  - You answer 5 questions each day
  - Questions reset automatically each day
  - Results are saved to your account

  This keeps learning short, consistent, and easy to return to.

  ## Who It’s For
  - Students learning digital safety
  - Beginners who want practical security awareness
  - Anyone who wants to build safer online habits in a fun
  format

  ## Project Structure (High Level)
  - `client/` Frontend app (Next.js + Tailwind)
  - `server/` Backend API (Express + MongoDB)
  - Auth is JWT-based
  - Game logic lives in backend routes + models
  - UI pages are in Next.js app routes

  ## Running Locally

  ### 1) Install dependencies
  ```bash
  npm install

  ### 2) Set environment variables

  Create a .env file with:

  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  NEXT_PUBLIC_API_BASE=http://localhost:5050

  ### 3) Start the app

  npm run dev

  Then open:

  - Frontend: http://localhost:3000
  - API: http://localhost:5050

  ## Current Focus

  TrustOrTrap currently focuses on core learning gameplay and
  account flows.
  Advanced systems (leaderboards, pet evolution, streak
  mechanics, etc.) are intentionally left out for now to keep
  the experience clean and simple.
