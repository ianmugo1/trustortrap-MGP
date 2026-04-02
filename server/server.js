import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import phishingRoutes from "./routes/phishingGame.js";
import cyberPetRoutes from "./routes/cyberpet.js";
import socialRoutes from "./routes/socialGame.js";


dotenv.config();

const app = express();
const PORT = 5050;

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.NEXT_PUBLIC_CLIENT_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many auth requests. Please try again in a few minutes.",
  },
});

// ---------- ENV CHECK ----------
const REQUIRED = ["MONGODB_URI", "JWT_SECRET"];
for (const v of REQUIRED) {
  if (!process.env[v]) {
    console.error(` Missing env var: ${v}`);
    process.exit(1);
  }
}

// ---------- CORE MIDDLEWARE ----------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ---------- ROUTES ----------
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/phishing", phishingRoutes);   // ✅ MUST COME BEFORE 404 HANDLER
app.use("/api/cyberpet", cyberPetRoutes);
app.use("/api/social",   socialRoutes);

// ---------- 404 HANDLER ----------
app.use((req, res) => {
  return res.status(404).json({ message: "Not found" });
});

// ---------- ERROR HANDLER ----------
app.use((err, _req, res, _next) => {
  console.error(" Server error:", err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

// ---------- STARTUP ----------
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("✓ MongoDB connected");

    app.listen(PORT, () => {
      console.log(` API running on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error(" Startup failed:", e.message);
    process.exit(1);
  }
})();
