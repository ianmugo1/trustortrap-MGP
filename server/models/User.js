import mongoose from "mongoose";


const phishingStatsSchema = new mongoose.Schema(
  {
    totalGames: { type: Number, default: 0 },
    totalQuestionsAnswered: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },   // highest score in a single run
    lastScore: { type: Number, default: 0 },   // score from the most recent completed game
    lastCompletedAt: { type: Date },           // when the user last finished the game
  },
  { _id: false } // we don't need a separate _id for this sub-document
);

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },

    // Coins for rewards / gamification
    coins: { type: Number, default: 0 },

    // stats for the phishing game
    phishingStats: {
      type: phishingStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
