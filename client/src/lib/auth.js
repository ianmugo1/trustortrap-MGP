const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

async function handle(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export const AuthAPI = {
  async register({ name, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    // Expect something like: { token, user }
    return handle(res);
  },

  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    // Expect something like: { token, user }
    return handle(res);
  },
};
