"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login"); // redirect target
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative flex items-center justify-center h-screen overflow-hidden text-white">
      {/* Background gradient + dots */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-blue-400">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        ></div>
      </div>

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

        <h1 className="text-5xl font-extrabold text-slate-900 drop-shadow">
          TrustOrTrap
        </h1>
        <p className="mt-2 text-base font-medium text-slate-800 opacity-80">
          Cyber Awareness Made Simple
        </p>
      </div>
    </main>
  );
}
