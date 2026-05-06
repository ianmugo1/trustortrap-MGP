import mongoose from "mongoose";

export const connectDB = async (uri) => {
  await mongoose.connect(uri, { dbName: "trustortrap" });
  console.log("✓ MongoDB connected");
};
