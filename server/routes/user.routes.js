import express from "express";
import bcrypt from "bcryptjs";
import { authenticateUser } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

const DEFAULT_SETTINGS = {
  notifications: {
    app: true,
    email: true,
  },
  app: {
    theme: "system",
    language: "en",
    soundEffects: true,
  },
  system: {
    biometrics: false,
    autoLockMinutes: 5,
  },
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
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/me/profile", authenticateUser, async (req, res) => {
  try {
    const { displayName, email } = req.body || {};
    const nextDisplayName = String(displayName || "").trim();
    const nextEmail = String(email || "").trim().toLowerCase();

    if (!nextDisplayName || !nextEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Username and email are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(nextEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email" });
    }

    const existingEmailUser = await User.findOne({
      email: nextEmail,
      _id: { $ne: req.user.id },
    });
    if (existingEmailUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { displayName: nextDisplayName, email: nextEmail },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/me/password", authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    return res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("Update password error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/me/settings", authenticateUser, async (req, res) => {
  try {
    const body = req.body || {};
    const updates = {};

    if (typeof body.notifications?.app === "boolean") {
      updates["settings.notifications.app"] = body.notifications.app;
    }
    if (typeof body.notifications?.email === "boolean") {
      updates["settings.notifications.email"] = body.notifications.email;
    }

    if (typeof body.app?.theme === "string") {
      const theme = body.app.theme;
      if (!["light", "dark", "system"].includes(theme)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid theme value" });
      }
      updates["settings.app.theme"] = theme;
    }
    if (typeof body.app?.language === "string") {
      updates["settings.app.language"] = body.app.language.trim() || "en";
    }
    if (typeof body.app?.soundEffects === "boolean") {
      updates["settings.app.soundEffects"] = body.app.soundEffects;
    }

    if (typeof body.system?.biometrics === "boolean") {
      updates["settings.system.biometrics"] = body.system.biometrics;
    }
    if (typeof body.system?.autoLockMinutes === "number") {
      const validAutoLock = [1, 5, 15, 30];
      if (!validAutoLock.includes(body.system.autoLockMinutes)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid auto-lock value" });
      }
      updates["settings.system.autoLockMinutes"] = body.system.autoLockMinutes;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      message: "Settings saved",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Update settings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/me", authenticateUser, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
