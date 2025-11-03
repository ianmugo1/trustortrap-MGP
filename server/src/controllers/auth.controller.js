import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const TOKEN_TTL = "7d";

export async function register(req, res) {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName)
      return res.status(400).json({ error: "All fields are required." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered." });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ email, passwordHash, displayName });

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_TTL,
    });

    res.status(201).json({
      user: { id: user._id, email: user.email, displayName: user.displayName },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_TTL,
    });

    res.json({
      user: { id: user._id, email: user.email, displayName: user.displayName },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed." });
  }
}
