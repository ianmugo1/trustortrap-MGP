"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { isPublicPathname } from "../lib/routes";

export default function AppFrame({ children }) {
  const pathname = usePathname();
  const isPublic = isPublicPathname(pathname);

  if (isPublic) {
    return children;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="relative flex-1 min-h-0 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #facc15 8px, transparent 8px), radial-gradient(circle, #3b82f6 8px, transparent 8px)",
              backgroundSize: "60px 60px",
              backgroundPosition: "0 0, 30px 30px",
            }}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
