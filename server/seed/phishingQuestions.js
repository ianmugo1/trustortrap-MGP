import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import PhishingQuestion from "../models/PhishingQuestion.js";
import phishingQuestions from "../data/phishingQuestions.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Adds new questions and updates existing ones, matched by question text.
// Nothing is deleted, so questions added by hand stay in the database.
async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("ERROR: MONGODB_URI not found in environment variables");
    process.exit(1);
  }

  // Same database name the API uses in config/db.js
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "trustortrap" });
  console.log("Connected to MongoDB.");

  const result = await PhishingQuestion.bulkWrite(
    phishingQuestions.map((question) => ({
      updateOne: {
        filter: { text: question.text },
        update: { $set: question },
        upsert: true,
      },
    }))
  );

  console.log(`Added ${result.upsertedCount}, updated ${result.modifiedCount}.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
