"use client";
import { useState } from "react";
import { AuthAPI } from "@/src/utils/auth";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import FormInput from "@/src/components/FormInput";
import Button from "@/src/components/Button";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [msg, setMsg]                 = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault(); setMsg("");
    try {
      const { token, user } = await AuthAPI.register({ displayName, email, password });
      signIn(token, user);
      router.replace("/dashboard");
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormInput placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        <FormInput type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <FormInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button>Sign up</Button>
      </form>
      {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
