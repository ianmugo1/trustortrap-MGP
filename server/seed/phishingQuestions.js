import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import PhishingQuestion from "../models/PhishingQuestion.js";

// Fix path for .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const questions = [
  {
    text: "You receive a text saying: 'You've won a free iPhone! Click here to claim.' What should you do?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Click the link to claim your prize",
      "Delete the message - this is a scam",
      "Reply with your address",
      "Forward it to friends",
    ],
    correctOption: 1,
  },
  {
    text: "Your bank emails you about suspicious activity and asks you to click a link. What should you do?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Click the link immediately",
      "Reply with your account details",
      "Contact your bank directly using their official website",
      "Ignore all emails from banks",
    ],
    correctOption: 2,
  },
  {
    text: "A friend messages you on Instagram: 'OMG look at this photo of you!' with a link. What's safest?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Click the link to see the photo",
      "Ask your friend directly if they sent this",
      "Share the link with others",
      "Reply asking for details",
    ],
    correctOption: 1,
  },
  {
    text: "Netflix emails you saying payment failed. The sender is netflix-billing@mail.com. What should you do?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Click the link to update payment",
      "Log into Netflix directly by typing netflix.com in your browser",
      "Reply with card details",
      "Call the number in the email",
    ],
    correctOption: 1,
  },
  {
    text: "Your school sends an exam schedule from your official school email. What should you do?",
    isPhishing: false,
    difficulty: "easy",
    options: [
      "Delete it - schools don't email",
      "Read it and check the school portal to confirm",
      "Report it as spam",
      "Forward your password to verify",
    ],
    correctOption: 1,
  },
  {
    text: "Someone on Discord offers free Nitro if you log into their website. What's the best response?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Log in quickly to get free Nitro",
      "Ignore and block - free Nitro scams are common",
      "Ask for more offers",
      "Share with your server",
    ],
    correctOption: 1,
  },
  {
    text: "Amazon emails confirming an order you didn't make. It has a 'Cancel Order' button. What should you do?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Click Cancel Order immediately",
      "Log into Amazon directly to check your orders",
      "Call the number in the email",
      "Reply saying you didn't order",
    ],
    correctOption: 1,
  },
  {
    text: "A pop-up says: 'Your computer is infected! Call this number now!' What should you do?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Call the number right away",
      "Close the browser and run your actual antivirus",
      "Enter credit card for the fix",
      "Download their recommended software",
    ],
    correctOption: 1,
  },
  {
    text: "Your phone company texts you a verification code you just requested. What type of message is this?",
    isPhishing: false,
    difficulty: "easy",
    options: [
      "A phishing attempt",
      "A legitimate two-factor authentication code",
      "A scam to steal your account",
      "A virus",
    ],
    correctOption: 1,
  },
  {
    text: "A WhatsApp message from an unknown number claims to be family needing money urgently. What should you do?",
    isPhishing: true,
    difficulty: "easy",
    options: [
      "Send money immediately",
      "Call your actual family member to verify",
      "Ask for their bank details",
      "Share your bank details",
    ],
    correctOption: 1,
  },
];

async function seed() {
  try {
    console.log("Using MONGODB_URI:", process.env.MONGODB_URI ? "Found" : "NOT FOUND");

    if (!process.env.MONGODB_URI) {
      console.error("ERROR: MONGODB_URI not found in environment variables");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    // Delete ALL existing questions
    const deleted = await PhishingQuestion.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} old questions.`);

    // Insert new MCQ questions
    const inserted = await PhishingQuestion.insertMany(questions);
    console.log(`Inserted ${inserted.length} new MCQ questions.`);

    console.log("Seed complete!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
