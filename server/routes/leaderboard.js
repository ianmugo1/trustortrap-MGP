import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// GET /api/leaderboard - top 50 users sorted by xp
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(50)
      .select("displayName xp level coins")
      .lean();

    return res.json({ success: true, users });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
