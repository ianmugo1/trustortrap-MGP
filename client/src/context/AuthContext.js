"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "tt_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on first mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
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
    isAuthenticated: !!user && !!token,
    signIn,
    signOut,
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
