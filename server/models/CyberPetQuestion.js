import mongoose from "mongoose";

const cyberPetQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4,
        message: "A cyber pet question must have exactly 4 options",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    topic: {
      type: String,
      default: "general",
      trim: true,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CyberPetQuestion ||
  mongoose.model("CyberPetQuestion", cyberPetQuestionSchema);
