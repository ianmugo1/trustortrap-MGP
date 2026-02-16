import mongoose from "mongoose";

const dailyQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    text: { type: String, required: true },
    options: { type: [String], default: [] },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: "" },
    userAnswerIndex: { type: Number, default: null },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const dailyProgressSchema = new mongoose.Schema(
  {
    dateKey: { type: String, default: "" },
    answeredCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const postureSchema = new mongoose.Schema(
  {
    strengthScore: { type: Number, default: 45, min: 0, max: 100 },
    reusedPassword: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    breachMonitoringEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const riskSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 70, min: 0, max: 100 },
    level: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "high",
    },
  },
  { _id: false }
);

const petStatusSchema = new mongoose.Schema(
  {
    mood: { type: Number, default: 70, min: 0, max: 100 },
    health: { type: Number, default: 75, min: 0, max: 100 },
    energy: { type: Number, default: 70, min: 0, max: 100 },
  },
  { _id: false }
);

const dailyStateSchema = new mongoose.Schema(
  {
    dateKey: { type: String, default: "" },
    actionsUsed: { type: Number, default: 0, min: 0 },
    maxActions: { type: Number, default: 3, min: 1 },
    tickApplied: { type: Boolean, default: false },
  },
  { _id: false }
);

const activeIncidentSchema = new mongoose.Schema(
  {
    type: { type: String, default: "" },
    severity: {
      type: String,
      enum: ["", "low", "medium", "high"],
      default: "",
    },
    status: {
      type: String,
      enum: ["", "active", "resolved", "ignored"],
      default: "",
    },
    createdAt: { type: Date, default: null },
  },
  { _id: false }
);

const incidentHistorySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    outcome: { type: String, default: "" },
    createdAt: { type: Date, required: true },
    resolvedAt: { type: Date, default: null },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0, min: 0 },
    best: { type: Number, default: 0, min: 0 },
    lastCheckInDateKey: { type: String, default: "" },
  },
  { _id: false }
);

const cyberPetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    health: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    happiness: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lastDailyReset: {
      type: Date,
      default: null,
    },
    dailyQuestions: {
      type: [dailyQuestionSchema],
      default: [],
    },
    dailyProgress: {
      type: dailyProgressSchema,
      default: () => ({}),
    },
    posture: {
      type: postureSchema,
      default: () => ({}),
    },
    risk: {
      type: riskSchema,
      default: () => ({}),
    },
    pet: {
      type: petStatusSchema,
      default: () => ({}),
    },
    daily: {
      type: dailyStateSchema,
      default: () => ({}),
    },
    activeIncident: {
      type: activeIncidentSchema,
      default: () => ({}),
    },
    incidentHistory: {
      type: [incidentHistorySchema],
      default: [],
    },
    streak: {
      type: streakSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.models.CyberPet || mongoose.model("CyberPet", cyberPetSchema);
