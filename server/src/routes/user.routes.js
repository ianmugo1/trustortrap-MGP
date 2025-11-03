import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import User from "../models/User.js";

const router = Router();

// GET /api/users/me  -> returns profile
router.get("/me", verifyToken, async (req, res) => {
  const user = await User.findById(req.user).select("_id email displayName coins badges createdAt");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;
