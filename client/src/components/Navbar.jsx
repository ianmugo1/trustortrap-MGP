"use client";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <nav className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">TrustOrTrap</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-700">Hi, {user.displayName}</span>
              <button className="border rounded px-3 py-1" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link className="text-sm" href="/login">Login</Link>
              <Link className="text-sm" href="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
