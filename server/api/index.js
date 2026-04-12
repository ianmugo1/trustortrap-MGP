import app, { initializeApp } from "../app.js";

export default async function handler(req, res) {
  try {
    const path = String(req.url || "");

    if (
      req.method === "OPTIONS" ||
      path === "/health" ||
      path === "/api/health"
    ) {
      return app(req, res);
    }

    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel handler startup failed:", error);
    return res.status(500).json({
      message: "Server configuration error",
    });
  }
}
