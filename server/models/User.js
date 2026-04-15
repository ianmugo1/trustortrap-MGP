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

const socialStatsSchema = new mongoose.Schema(
  {
    totalGames:      { type: Number, default: 0 },
    bestScore:       { type: Number, default: 0 },
    lastScore:       { type: Number, default: 0 },
    lastCompletedAt: { type: Date },
  },
  { _id: false }
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

const masteryTopicSchema = new mongoose.Schema(
  {
    answered: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ["new", "building", "steady", "strong"],
      default: "new",
    },
    lastPracticedAt: { type: Date, default: null },
  },
  { _id: false }
);

const masterySchema = new mongoose.Schema(
  {
    phishing: { type: masteryTopicSchema, default: () => ({}) },
    passwords: { type: masteryTopicSchema, default: () => ({}) },
    privacy: { type: masteryTopicSchema, default: () => ({}) },
    aiSafety: { type: masteryTopicSchema, default: () => ({}) },
    socialScams: { type: masteryTopicSchema, default: () => ({}) },
  },
  { _id: false }
);

const storyChapterProgressSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    relatedTopic: { type: String, default: "" },
  },
  { _id: false }
);

const storyProgressSchema = new mongoose.Schema(
  {
    completedSlugs: { type: [String], default: [] },
    completedCount: { type: Number, default: 0 },
    lastCompletedSlug: { type: String, default: "" },
    lastCompletedAt: { type: Date, default: null },
    chapters: { type: [storyChapterProgressSchema], default: [] },
  },
  { _id: false }
);

const shopSchema = new mongoose.Schema(
  {
    ownedItemIds: { type: [String], default: [] },
    equipped: {
      petSkin: { type: String, default: "skin-classic" },
      roomTheme: { type: String, default: "theme-terminal" },
      badge: { type: String, default: "badge-none" },
    },
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
    displayName: { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:   { type: String, required: true },

    // Coins for rewards / gamification
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

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
    socialStats: {
      type: socialStatsSchema,
      default: () => ({}),
    },
    mastery: {
      type: masterySchema,
      default: () => ({}),
    },
    storyProgress: {
      type: storyProgressSchema,
      default: () => ({}),
    },
    shop: {
      type: shopSchema,
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
