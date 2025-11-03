import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { dbName: "trustortrap" });
    console.log(" MongoDB connected");
  } catch (err) {
    console.error(" Database connection failed:", err.message);
    process.exit(1);
  }
}
