import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import {
  getAllowedOriginPatterns,
  getAllowedOrigins,
  getRequiredEnv,
  loadEnv,
} from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import phishingRoutes from "./routes/phishingGame.js";
import cyberPetRoutes from "./routes/cyberpet.js";
import socialRoutes from "./routes/socialGame.js";

loadEnv();

const app = express();
let startupPromise;

function isAllowedOrigin(origin, allowedOrigins, allowedOriginPatterns) {
  const normalizedOrigin = String(origin || "").trim().replace(/\/+$/, "");

  return (
    allowedOrigins.includes(normalizedOrigin) ||
    allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin))
  );
}

function createCorsOptions() {
  const allowedOrigins = getAllowedOrigins();
  const allowedOriginPatterns = getAllowedOriginPatterns();

  return {
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin, allowedOrigins, allowedOriginPatterns)) {
        return callback(null, true);
      }

      const error = new Error("CORS origin not allowed");
      error.status = 403;
      return callback(error);
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

function validateEnv() {
  getRequiredEnv("MONGODB_URI");
  getRequiredEnv("JWT_SECRET");
}

const corsOptions = createCorsOptions();
const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const DEFAULT_ALLOWED_HEADERS = ["Content-Type", "Authorization"];

function appendVaryHeader(res, value) {
  const current = res.getHeader("Vary");

  if (!current) {
    res.setHeader("Vary", value);
    return;
  }

  const values = String(current)
    .split(",")
    .map((part) => part.trim());

  if (!values.includes(value)) {
    res.setHeader("Vary", `${String(current)}, ${value}`);
  }
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many auth requests. Please try again in a few minutes.",
  },
});

app.disable("x-powered-by");

if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") {
    return next();
  }

  const origin = String(req.headers.origin || "").trim();
  const allowedOrigins = getAllowedOrigins();
  const allowedOriginPatterns = getAllowedOriginPatterns();

  if (origin && !isAllowedOrigin(origin, allowedOrigins, allowedOriginPatterns)) {
    const error = new Error("CORS origin not allowed");
    error.status = 403;
    return next(error);
  }

  appendVaryHeader(res, "Origin");
  appendVaryHeader(res, "Access-Control-Request-Headers");
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS.join(","));
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || DEFAULT_ALLOWED_HEADERS.join(",")
  );

  return res.status(204).end();
});
app.use(express.json({ limit: "1mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get(["/health", "/api/health"], (_req, res) => {
  return res.json({ status: "ok" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/users", userRoutes);
app.use("/api/phishing", phishingRoutes);
app.use("/phishing", phishingRoutes);
app.use("/api/cyberpet", cyberPetRoutes);
app.use("/cyberpet", cyberPetRoutes);
app.use("/api/social", socialRoutes);
app.use("/social", socialRoutes);

app.use((_req, res) => {
  return res.status(404).json({ message: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Server error:", err);

  return res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

export async function initializeApp() {
  if (!startupPromise) {
    startupPromise = (async () => {
      validateEnv();
      await connectDB(process.env.MONGODB_URI);
    })().catch((error) => {
      startupPromise = null;
      throw error;
    });
  }

  return startupPromise;
}

export default app;
