// src/context/AuthContext.jsx
"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe } from "@/src/utils/api";

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // try to hydrate user on load if cookie/JWT is present
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  // your existing signIn/signOut – keep as-is; example:
  async function signOut() {
    // if you have a backend logout, call it here; otherwise just clear state
    setUser(null);
    // optionally redirect to /login
  }

  const value = { user, setUser, loading, refreshUser, signOut };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
