"use client";

import Image from "next/image";

export default function Home() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-slate-950 px-4">
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-md space-y-5">

          {/* LOGO */}
          <div className="mx-auto relative h-24 w-24 md:h-28 md:w-28">
            <Image
              src="/logo.png"
              alt="TrustOrTrap Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* TITLE */}
          <h1 className="text-4xl font-extrabold text-white">TrustOrTrap</h1>

          {/* SUBTITLE */}
          <p className="text-slate-300 text-sm">
            A smarter way to improve your cyber awareness.
          </p>

          {/* ACTIONS */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="/login"
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow hover:bg-emerald-700 transition"
            >
              Login
            </a>

            <a
              href="/register"
              className="rounded-lg border border-slate-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              Register
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
