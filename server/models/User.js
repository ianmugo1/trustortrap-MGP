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

const cyberPetStatsSchema = new mongoose.Schema(
  {
    takeoversPrevented: { type: Number, default: 0 },
    totalIncidents: { type: Number, default: 0 },
    resolvedIncidents: { type: Number, default: 0 },
    avgRiskScore: { type: Number, default: 0 },
    riskSamples: { type: Number, default: 0 },
    twoFactorAdoptionDate: { type: Date, default: null },
    breachMonitoringAdoptionDate: { type: Date, default: null },
  },
  { _id: false }
);

const userSettingsSchema = new mongoose.Schema(
  {
    notifications: {
      app: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
    app: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: { type: String, default: "en" },
      soundEffects: { type: Boolean, default: true },
    },
    system: {
      biometrics: { type: Boolean, default: false },
      autoLockMinutes: { type: Number, default: 5 },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },

    // Coins for rewards / gamification
    coins: { type: Number, default: 0 },

    // Learning interest picked during registration
    learningInterest: { type: String, default: "" },

    // stats for the phishing game
    phishingStats: {
      type: phishingStatsSchema,
      default: () => ({}),
    },
    cyberPetStats: {
      type: cyberPetStatsSchema,
      default: () => ({}),
    },
    settings: {
      type: userSettingsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
