# TrustOrTrap

TrustOrTrap is a cyber awareness app designed to help beginners build safer
online habits through short, interactive challenges.

Instead of relying on long explanations, the app teaches users through
practical activities such as spotting phishing attempts, making safer decisions
online, and completing daily Cyber Pet challenges.

## Features

- Secure sign up and login
- Phishing awareness game
- Social scam awareness challenges
- Daily Cyber Pet mode
- Progress dashboard
- Kid-friendly story-based learning pages
- Leaderboard, streak tracking, and story progress
- Cosmetic shop tied to coins and levels

## Cyber Pet Mode

Cyber Pet is designed as a simple daily learning habit:

- 5 short cybersecurity questions per day
- Correct answers improve pet health
- Wrong answers reduce pet health
- Questions reset each day
- Progress is saved to the user account

## Why This Project Matters

Many people know cyber threats exist, but learning cybersecurity often feels too
technical or overwhelming. TrustOrTrap makes cyber safety easier to understand
by turning important lessons into short, practical experiences.

## Who It's For

- Students learning digital safety
- Beginners exploring cybersecurity
- Anyone who wants to build safer online habits in a more engaging way

## Project Structure

- `client/` Next.js + Tailwind frontend
- `server/` Express + MongoDB backend
- JWT-based authentication
- Backend routes and models handle game logic
- Next.js app routes handle the user interface

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Add environment variables

Create a `.env` file in the project root. You can copy `.env.example`.

Required values:

- `PORT=5050`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_long_random_jwt_secret`
- `CLIENT_ORIGIN=http://localhost:3000`
- `NEXT_PUBLIC_API_BASE=http://localhost:5050`

### 3. Seed the game content

The phishing and social games expect MongoDB content to be present before they
can run fully.

```bash
npm --prefix server run seed:phishing
npm --prefix server run seed:social
```

### 4. Start the app

```bash
npm run dev
```

Then open:

- Frontend: `http://localhost:3000`
- API: `http://localhost:5050`

## Submission Notes

TrustOrTrap currently focuses on core gameplay, learning experiences, and
account features. The current build includes leaderboards, streak tracking,
story progress, account settings, and a simple cosmetic shop alongside the main
learning activities.
