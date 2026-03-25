import { NETWORK_ERROR_MESSAGE } from "./api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

async function handle(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
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
