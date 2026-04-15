import dotenv from "dotenv";

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  dotenv.config();
  loaded = true;
}

export function getRequiredEnv(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export function getAllowedOrigins() {
  return [
    process.env.CLIENT_ORIGIN,
    process.env.NEXT_PUBLIC_CLIENT_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ]
    .map((value) => String(value || "").trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

export function getAllowedOriginPatterns() {
  return [
    /^https:\/\/trustortrap-web(?:-[a-z0-9-]+)?\.vercel\.app$/i,
    /^https:\/\/trustortrap(?:-[a-z0-9-]+)?-courseconnect\.vercel\.app$/i,
    /^https:\/\/trustortrap-web-git-[a-z0-9-]+-courseconnect\.vercel\.app$/i,
  ];
}
