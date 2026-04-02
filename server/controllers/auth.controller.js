import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createAuthToken } from "../lib/auth.js";
import { sanitizeUser } from "../lib/user.js";

export const register = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already exists" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ displayName, email, password: hash });
    const token = createAuthToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = createAuthToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
