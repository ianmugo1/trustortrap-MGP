"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      className="relative flex items-center justify-center h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #facc15 0%, #3b82f6 100%)" // yellow -> blue
      }}
    >
      {/* Center content */}
      <div className="relative z-10 text-center animate-fadeIn">
        <div className="mx-auto mb-6 w-[22rem] h-[22rem] drop-shadow-2xl">
          <Image
            src="/TrustortrapLOGO.png"
            alt="TrustOrTrap logo"
            width={352}
            height={352}
            className="mx-auto"
            priority
          />
        </div>

        <h1
          className="text-5xl font-extrabold drop-shadow"
          style={{
            background: "linear-gradient(to right, #e99f00ff, #151101ff)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          TrustOrTrap
        </h1>

        <p className="mt-2 text-base font-medium text-slate-900 opacity-90">
          Cyber Awareness Made Simple
        </p>
      </div>
    </main>
  );
}
