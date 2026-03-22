import mongoose from "mongoose";

const socialAiImageSchema = new mongoose.Schema(
  {
    subject:  { type: String, required: true },
    type:     { type: String, enum: ["single", "side-by-side"], required: true },
    imgSrc:   { type: String, required: true },
    isAI:     { type: Boolean },           // used when type === "single"
    realSide: { type: String },            // "left" | "right", used when type === "side-by-side"
    aiTells:  { type: [String], default: [] },
    tell:     { type: String, required: true },
    order:    { type: Number, required: true },
  },
  { timestamps: false }
);

export default mongoose.model("SocialAiImage", socialAiImageSchema);
