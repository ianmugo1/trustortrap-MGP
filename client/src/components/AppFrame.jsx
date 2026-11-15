"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { isPublicPathname } from "../lib/routes";
import { FloatingShapes, PageTransition } from "./motion";

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

        <main className="relative flex-1 min-h-0 overflow-auto bg-slate-950">
          <div className="tt-aurora" aria-hidden="true" />
          <FloatingShapes />
          <PageTransition key={pathname} className="relative">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
