import mongoose from "mongoose";

const { Schema } = mongoose;

const PhishingQuestionSchema = new Schema(
  {
    // The question text shown to the user
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // Whether this message / email is phishing (true) or safe (false)
    isPhishing: {
      type: Boolean,
      required: true,
    },

    // Optional image fields for visual scenarios
    image: {
      type: String,
      default: "",
      trim: true,
    },
    imageLeft: {
      type: String,
      default: "",
      trim: true,
    },
    imageRight: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional for dual-image questions: which side is phishing
    phishingSide: {
      type: String,
      enum: ["left", "right"],
      default: "",
    },

    // Optional explanation shown after answering
    explanation: {
      type: String,
      default: "",
      trim: true,
    },

    // Optional difficulty flag
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    // Optional category, e.g. "email", "sms", "social"
    category: {
      type: String,
      default: "email",
      trim: true,
    },

    // Optional topic label used by some UI
    topic: {
      type: String,
      default: "",
      trim: true,
    },

    // Multiple choice options (A, B, C, D)
    options: {
      type: [String],
      default: [],
    },

    // Index of the correct option (0-3)
    correctOption: {
      type: Number,
      min: 0,
      max: 3,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PhishingQuestion ||
  mongoose.model("PhishingQuestion", PhishingQuestionSchema);
