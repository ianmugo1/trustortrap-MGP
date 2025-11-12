// src/app/register/page.js
"use client";
import { useState } from "react";
import { AuthAPI } from "@/src/utils/api"; 
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import FormInput from "@/src/components/FormInput";
import Button from "@/src/components/Button";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [msg, setMsg]                 = useState("");
  const [loading, setLoading]         = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await AuthAPI.register({
        displayName: displayName.trim(),
        email: email.trim(),
        password
      });

      // If your API returns token+user, auto-login:
      if (token && user) {
        signIn(token, user);
        router.replace("/dashboard");
      } else {
        // If you’re using httpOnly cookies (no token in body), just redirect:
        router.replace("/dashboard"); // or "/login" depending on your flow
      }
    } catch (err) {
      setMsg(err?.message || "Registration failed.");
      // Optional: surface more detail during dev
      // console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput
          placeholder="Display name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
        />
        <FormInput
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <FormInput
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {/* Ensure your Button renders <button type="submit"> */}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign up"}
        </Button>
      </form>
      {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
