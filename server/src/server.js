import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();

// ----------------------
// Middleware
// ----------------------

// Enable security headers
app.use(helmet());

// Log all requests in development mode
app.use(morgan("dev"));

// Parse JSON request bodies
app.use(express.json());

// Configure CORS (allow frontend origin)
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// ----------------------
// Health check endpoint
// ----------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "trustortrap-api" });
});

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ----------------------
// Server startup
// ----------------------
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(" Failed to start server:", err.message);
    process.exit(1);
  }
})();
