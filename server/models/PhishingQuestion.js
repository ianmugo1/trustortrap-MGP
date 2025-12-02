import mongoose from "mongoose";

const PhishingQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  correct: { type: String, required: true }, // "Safe" or "Phishing"

  // Single-image questions
  image: { type: String },

  // Two-image spot the difference
  imageLeft: { type: String },
  imageRight: { type: String },
});

export default mongoose.models.PhishingQuestion ||
  mongoose.model("PhishingQuestion", PhishingQuestionSchema);
