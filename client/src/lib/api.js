function normalizeApiBase(rawBase) {
  const fallback = "http://localhost:5050";
  const value = String(rawBase || fallback).trim();

  if (!value) return fallback;

  return value
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
}

export const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE);

const STORAGE_KEY = "tt_auth";
const EXPIRED_KEY = "tt_session_expired";
export const NETWORK_ERROR_MESSAGE = `Unable to reach the API server at ${API_BASE}.`;

function createJsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status || 500,
    statusText: init.statusText,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

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

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    return createJsonResponse(
      {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      },
      {
        status: 503,
        statusText: "Service Unavailable",
      }
    );
  }

  if (res.status === 401 || res.status === 403) {
    markSessionExpired();
  }

  return res;
}
