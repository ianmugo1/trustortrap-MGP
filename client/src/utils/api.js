// src/utils/api.js
const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

// Helper to unwrap JSON safely
async function toJson(res) {
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE}/api/users/me`, {
    method: "GET",
    credentials: "include",
  });
  return toJson(res);
}

export async function updateProfile(payload) {
  const res = await fetch(`${BASE}/api/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return toJson(res);
}
