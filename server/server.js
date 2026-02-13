import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import phishingRoutes from "./routes/phishingGame.js";
import cyberPetRoutes from "./routes/cyberpet.js";


dotenv.config();

const app = express();

// ---------- ENV CHECK ----------
const REQUIRED = ["MONGODB_URI", "JWT_SECRET"];
for (const v of REQUIRED) {
  if (!process.env[v]) {
    console.error(` Missing env var: ${v}`);
    process.exit(1);
  }
}

// ---------- CORS ----------
app.use(
  cors({
    origin: true, // allow localhost:3000
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// ---------- CORE MIDDLEWARE ----------
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// ---------- ROUTES ----------
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/phishing", phishingRoutes);   // ✅ MUST COME BEFORE 404 HANDLER
app.use("/api/cyberpet", cyberPetRoutes);

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
const PORT = 5050;

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
