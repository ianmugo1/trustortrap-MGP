// server/src/routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

const DEFAULT_SETTINGS = {
  notifications: { app: true, email: true },
  app: { theme: "system", language: "en", soundEffects: true },
  system: { biometrics: false, autoLockMinutes: 5 },
};

const sanitizeUser = (user) => ({
  id: user._id,
  displayName: user.displayName,
  email: user.email,
  coins: user.coins || 0,
  phishingStats: user.phishingStats || {},
  settings: {
    notifications: {
      app: user.settings?.notifications?.app ?? DEFAULT_SETTINGS.notifications.app,
      email:
        user.settings?.notifications?.email ?? DEFAULT_SETTINGS.notifications.email,
    },
    app: {
      theme: user.settings?.app?.theme ?? DEFAULT_SETTINGS.app.theme,
      language: user.settings?.app?.language ?? DEFAULT_SETTINGS.app.language,
      soundEffects:
        user.settings?.app?.soundEffects ?? DEFAULT_SETTINGS.app.soundEffects,
    },
    system: {
      biometrics:
        user.settings?.system?.biometrics ?? DEFAULT_SETTINGS.system.biometrics,
      autoLockMinutes:
        user.settings?.system?.autoLockMinutes ??
        DEFAULT_SETTINGS.system.autoLockMinutes,
    },
  },
});

// ---------------- REGISTER ----------------
router.post("/register", async (req, res) => {
  try {
    const { displayName, email, password, learningInterest } = req.body || {};

    if (!displayName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Display name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      displayName,
      email,
      password: hashedPassword,
      learningInterest: learningInterest || "",
    });

    // Sign JWT (30d)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Register error:", err);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // Sign JWT (30d)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// ---------------- ME ----------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        ...sanitizeUser(user),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get me error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

export default router;
