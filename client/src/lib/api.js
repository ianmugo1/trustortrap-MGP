const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5050";

const STORAGE_KEY = "tt_auth";
const EXPIRED_KEY = "tt_session_expired";

function markSessionExpired() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(EXPIRED_KEY, "1");
  } catch {}
}

export async function authFetch(path, options = {}, token) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    markSessionExpired();
  }

  return res;
}
