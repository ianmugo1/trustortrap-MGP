import express from "express";
import PhishingQuestion from "../models/PhishingQuestion.js";
import PhishingResult from "../models/PhishingResult.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/questions", authenticateUser, async (req, res) => {
  try {
    const questions = await PhishingQuestion.aggregate([{ $sample: { size: 10 } }]);
    res.json({ success: true, questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ success: false, message: "Error loading questions" });
  }
});

router.post("/submit", authenticateUser, async (req, res) => {
  const { questionId, answerGiven } = req.body;

  try {
    const q = await PhishingQuestion.findById(questionId);
    if (!q)
      return res.status(404).json({ success: false, message: "Question not found" });

    let isCorrect = false;

    if (q.imageLeft && q.imageRight) {
      if (!q.phishingSide) {
        return res
          .status(422)
          .json({ success: false, message: "Question is missing phishingSide" });
      }
      isCorrect = answerGiven === q.phishingSide;
    } else {
      if (answerGiven !== "Phishing" && answerGiven !== "Safe") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid answer format" });
      }
      isCorrect = q.isPhishing ? answerGiven === "Phishing" : answerGiven === "Safe";
    }

    await PhishingResult.create({
      userId: req.user.id,
      questionId,
      answerGiven,
      isCorrect,
    });

    res.json({ success: true, isCorrect });
  } catch (err) {
    console.error("Error submitting answer:", err);
    res.status(500).json({ success: false, message: "Error submitting answer" });
  }
});

export default router;
