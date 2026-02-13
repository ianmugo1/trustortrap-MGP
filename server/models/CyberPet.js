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
  },
  { timestamps: true }
);

export default mongoose.models.CyberPet || mongoose.model("CyberPet", cyberPetSchema);
