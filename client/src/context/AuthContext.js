"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

  function signIn(newToken, newUser) {
    setUser(newUser);
    setToken(newToken);
    setSessionExpired(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
  }

  function signOut() {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    user,
    token,
    loading,
    sessionExpired,
    isAuthenticated: !!user && !!token,
    signIn,
    signOut,
    clearSessionExpired: () => setSessionExpired(false),
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
