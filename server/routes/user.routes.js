import express from "express";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authenticateUser, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
