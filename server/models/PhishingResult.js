import mongoose from "mongoose";

const PhishingResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PhishingQuestion",
    required: true,
  },
  answerGiven: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.PhishingResult ||
  mongoose.model("PhishingResult", PhishingResultSchema);
