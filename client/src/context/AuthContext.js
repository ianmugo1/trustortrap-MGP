"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "tt_auth";
const EXPIRED_KEY = "tt_session_expired";

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const expiredFlag = localStorage.getItem(EXPIRED_KEY);
      if (expiredFlag) {
        localStorage.removeItem(EXPIRED_KEY);
        setSessionExpired(true);
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const storedToken = parsed.token || null;
        if (storedToken && isTokenExpired(storedToken)) {
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
          setToken(null);
          setSessionExpired(true);
        } else {
          setUser(parsed.user || null);
          setToken(storedToken);
        }
      }
    } catch (err) {
      console.error("Failed to load auth from storage", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setToken(null);
      setSessionExpired(true);
    };
    window.addEventListener("tt:session-expired", handleExpired);
    return () => window.removeEventListener("tt:session-expired", handleExpired);
  }, []);

  function signIn(newToken, newUser) {
    setUser(newUser);
    setToken(newToken);
    setSessionExpired(false);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: newToken, user: newUser })
    );
  }

  function signOut() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // ✅ Fetch latest user from backend and update context + localStorage
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await authFetch("/api/users/me", {}, token);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setUser(null);
          setToken(null);
          setSessionExpired(true);
        }
        console.error("refreshUser failed:", res.status);
        return;
      }

      const data = await res.json();

      // Support both response shapes: { user: {...} } or direct user object
      const freshUser = data.user ?? data;

      setUser(freshUser);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token, user: freshUser })
      );
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    sessionExpired,
    isAuthenticated: !!user && !!token,
    signIn,
    signOut,
    clearSessionExpired: () => setSessionExpired(false),
    refreshUser, // ✅ NOW dashboard can call it
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
