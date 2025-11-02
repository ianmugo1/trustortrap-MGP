"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "@/src/utils/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // 1) Initialize token from localStorage (no effect needed)
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("tt_token") : null
  );

  const [user, setUser] = useState(null);
  // 2) loading is true only if we have a token that needs verification
  const [loading, setLoading] = useState(Boolean(token));

  // 3) Verify token when it changes
  useEffect(() => {
    if (!token) {
      // no token → not loading, ensure user is cleared
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { user } = await AuthAPI.me(token);
        if (!cancelled) setUser(user);
      } catch {
        // invalid/expired token → clear it
        if (!cancelled) {
          localStorage.removeItem("tt_token");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  function signIn(newToken, newUser) {
    localStorage.setItem("tt_token", newToken);
    setToken(newToken);      // triggers the effect to (re)validate
    setUser(newUser ?? null);
  }

  function signOut() {
    localStorage.removeItem("tt_token");
    setToken(null);
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthCtx.Provider value={{ token, user, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
