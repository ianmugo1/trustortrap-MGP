const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""; 

export async function api(path, { method = "GET", headers = {}, body } = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // keep if you use cookies/JWT
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export default api;

// --- Convenience API helpers ---
export async function getMe() {
  // Adjust path if your server route differs
  return api("/api/users/me");
}

export async function login({ email, password }) {
  return api("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function logout() {
  return api("/api/auth/logout", { method: "POST" });
}

export async function updateProfile(payload) {
  return api("/api/users/me", {
    method: "PUT",
    body: payload,
  });
}

