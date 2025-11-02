export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function api(path, { method = "GET", token, data } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store"
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}
