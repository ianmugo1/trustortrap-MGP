import mongoose from "mongoose";

const PhishingQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  correct: { type: String, required: true }, // "Safe" / "Phishing" / "left" / "right"
  image: { type: String },
  imageLeft: { type: String },
  imageRight: { type: String },
  topic: { type: String },
});

export default mongoose.models.PhishingQuestion ||
  mongoose.model("PhishingQuestion", PhishingQuestionSchema);
