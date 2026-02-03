import mongoose from "mongoose";
import dotenv from "dotenv";
import PhishingQuestion from "../models/PhishingQuestion.js";

dotenv.config();

const questions = [
  {
    text: "Your bank emails you: 'Unusual login detected. Click here to secure your account.' What should you do?",
    isPhishing: true,
    options: [
      "Click the link immediately to secure your account",
      "Ignore the email completely",
      "Contact your bank directly using their official website or phone number",
      "Reply to the email asking for more details",
    ],
    correctOption: 2,
  },
  {
    text: "Your university emails you about scheduled password maintenance. What is the best response?",
    isPhishing: false,
    options: [
      "This is a phishing attempt - delete immediately",
      "Verify through official university channels before taking action",
      "Forward it to all your contacts as a warning",
      "Click any links to reset your password right away",
    ],
    correctOption: 1,
  },
  {
    text: "PayPal: 'Your account will be closed unless you verify now.' How should you respond?",
    isPhishing: true,
    options: [
      "Click the verification link to save your account",
      "This is legitimate - PayPal often sends urgent requests",
      "Log into PayPal directly through their official website to check",
      "Reply with your account details to verify",
    ],
    correctOption: 2,
  },
  {
    text: "Google prompts you to review a new sign-in from Dublin. What should you do?",
    isPhishing: false,
    options: [
      "This is definitely a scam - Google never sends these",
      "Check your Google account security settings directly",
      "Click the link in the email immediately",
      "Ignore it completely",
    ],
    correctOption: 1,
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
