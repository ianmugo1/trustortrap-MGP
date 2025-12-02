import mongoose from "mongoose";
import dotenv from "dotenv";
import PhishingQuestion from "../models/PhishingQuestion.js";

dotenv.config();

const questions = [
  {
    text: "Your bank emails you: 'Unusual login detected. Click here to secure your account.'",
    correct: "Phishing",
  },
  {
    text: "Your university emails you about scheduled password maintenance.",
    correct: "Safe",
  },
  {
    text: "PayPal: 'Your account will be closed unless you verify now.'",
    correct: "Phishing",
  },
  {
    text: "Google prompts you to review a new sign-in from Dublin.",
    correct: "Safe",
  },
];

async function seed() {
  console.log("Using MONGODB_URI:", process.env.MONGODB_URI);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  await PhishingQuestion.deleteMany();
  await PhishingQuestion.insertMany(questions);

  console.log("Questions seeded.");
  mongoose.disconnect();
}

seed();
