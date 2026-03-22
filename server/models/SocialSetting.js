import mongoose from "mongoose";

const socialSettingSchema = new mongoose.Schema(
  {
    label:     { type: String,  required: true },
    desc:      { type: String,  required: true },
    dangerous: { type: Boolean, required: true },
    current:   { type: String,  required: true },
    safe:      { type: String,  default: null },
    tip:       { type: String,  default: "" },
    order:     { type: Number,  required: true },
  },
  { timestamps: false }
);

export default mongoose.model("SocialSetting", socialSettingSchema);
