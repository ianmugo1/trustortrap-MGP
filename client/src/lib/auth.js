import { NETWORK_ERROR_MESSAGE } from "./api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

function normalizeAuthMessage(message, fallback) {
  const raw = String(message || "").trim();

  if (!raw) return fallback;
  if (raw === NETWORK_ERROR_MESSAGE) return raw;

  const normalized = raw.toLowerCase();

  if (normalized.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }

  if (
    normalized.includes("email is already in use") ||
    normalized.includes("email already exists")
  ) {
    return "That email is already in use. Try signing in instead.";
  }

  if (
    normalized.includes("display name, email and password are required") ||
    normalized.includes("email and password required")
  ) {
    return "Please fill in all required fields.";
  }

  return raw;
}

async function handle(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(normalizeAuthMessage(msg, "Authentication failed."));
  }
  return data;
}

export const AuthAPI = {
  async register({ name, email, password, learningInterest }) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: name.trim(),
          email: email.trim(),
          password: password.trim(),
          learningInterest: learningInterest || "",
        }),
      });
    } catch {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    return handle(res);
  },

  async login({ email, password }) {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
    } catch {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }

    return handle(res);
  },
};
