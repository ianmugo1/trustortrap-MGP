import mongoose from "mongoose";

const PhishingQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  correct: { type: String, required: true }, // "Safe" or "Phishing"
});

export default mongoose.models.PhishingQuestion ||
  mongoose.model("PhishingQuestion", PhishingQuestionSchema);
