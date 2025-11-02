"use client";
import Protected from "@/src/components/Protected";
import { useAuth } from "@/src/context/AuthContext";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <Protected>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <button className="border rounded px-3 py-1" onClick={signOut}>Sign out</button>
        </div>
        <div className="border rounded p-4">
          <p><strong>User:</strong> {user?.displayName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Coins:</strong> {user?.coins ?? 0}</p>
          <p><strong>Badges:</strong> {(user?.badges || []).join(", ") || "None"}</p>
        </div>
      </div>
    </Protected>
  );
}
