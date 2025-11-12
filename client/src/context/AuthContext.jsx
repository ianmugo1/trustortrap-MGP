"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, AuthAPI } from "@/src/utils/api";

const AuthContext = createContext({
  user: null,
  ready: false,
  signIn: () => {},
  signOut: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Try to restore session (cookie-based or token in storage if you use that)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await getMe();
        if (alive) setUser(me);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Sign in: store token (if returned) and set user
  const signIn = (token, userObj) => {
    try {
      if (token) localStorage.setItem("tt_token", token); // optional if you use cookies
    } catch {}
    setUser(userObj ?? null);
  };

  // Sign out: call API (cookie), clear token, reset user
  const signOut = async () => {
    try { await AuthAPI.logout(); } catch {}
    try { localStorage.removeItem("tt_token"); } catch {}
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, ready, signIn, signOut, setUser }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
