"use client";

import Link from "next/link";
import { ShieldAlert, UserCheck, Target } from "lucide-react";

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-8">Choose a Game</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">

        {/* Phishing */}
        <Link
          href="/games/phishing"
          className="block bg-white p-6 rounded-xl border shadow hover:shadow-lg transition cursor-pointer text-center"
        >
          <div className="flex flex-col items-center">
            <ShieldAlert className="w-12 h-12 text-blue-600" />
            <h2 className="text-xl font-semibold mt-4">Phishing Detection</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Identify fake emails and dangerous messages.
            </p>
          </div>
        </Link>

        {/* Password */}
        <Link
          href="/games/password/page.jsx"
          className="block bg-white p-6 rounded-xl border shadow hover:shadow-lg transition cursor-pointer text-center"
        >
          <div className="flex flex-col items-center">
            <UserCheck className="w-12 h-12 text-yellow-600" />
            <h2 className="text-xl font-semibold mt-4">Password Hygiene</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Learn how to spot weak passwords.
            </p>
          </div>
        </Link>

        {/* Social Media Safety */}
        <Link
          href="/games/social/page.jsx"
          className="block bg-white p-6 rounded-xl border shadow hover:shadow-lg transition cursor-pointer text-center"
        >
          <div className="flex flex-col items-center">
            <Target className="w-12 h-12 text-red-600" />
            <h2 className="text-xl font-semibold mt-4">Social Media Safety</h2>
            <p className="mt-2 text-gray-600 text-sm">
              Make the safest choice in online scenarios.
            </p>
          </div>
        </Link>

      </div>
    </main>
  );
}
