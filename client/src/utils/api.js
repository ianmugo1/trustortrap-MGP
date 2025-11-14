/**
 * API Utility
 * Centralised fetch wrapper for TrustOrTrap frontend
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

/** Unified fetch helper with timeout and safe error parsing */
export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s safety timeout

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: options.method || "GET",
      credentials: "include", // allows cookie-based sessions
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...(options.body ? { body: options.body } : {}),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Parse response body
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      const msg =
        data?.message ||
        `HTTP ${res.status}: ${res.statusText || "Unknown error"}`;
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    clearTimeout(timeout);

    // Handle network and timeout errors explicitly
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    if (err.message.includes("Failed to fetch")) {
      throw new Error(
        "Network error — server might be offline or blocked by CORS."
      );
    }

    throw err;
  }
}

/**  Auth endpoints */
export const AuthAPI = {
  /** Register a new user */
  register: (body) =>
    apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Login user */
  login: (body) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  /** Get the currently logged-in user */
  me: (token) =>
    apiFetch("/api/users/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  /** Logout (clears cookie) */
  logout: () =>
    apiFetch("/api/auth/logout", {
      method: "POST",
    }),
};

/** Shorthand for `AuthAPI.me()` */
export const getMe = (token) => AuthAPI.me(token);
