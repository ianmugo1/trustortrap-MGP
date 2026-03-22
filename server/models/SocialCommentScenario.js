import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    handle: { type: String, required: true },
    text:   { type: String, required: true },
    isBot:  { type: Boolean, required: true },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    handle: { type: String, required: true },
    text:   { type: String, required: true },
    likes:  { type: Number, required: true },
    time:   { type: String, required: true },
  },
  { _id: false }
);

const socialCommentScenarioSchema = new mongoose.Schema(
  {
    post:     { type: postSchema,      required: true },
    comments: { type: [commentSchema], required: true },
    tip:      { type: String,          required: true },
    order:    { type: Number,          required: true },
  },
  { timestamps: false }
);

export default mongoose.model("SocialCommentScenario", socialCommentScenarioSchema);
