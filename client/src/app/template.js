"use client";
import { usePathname } from "next/navigation";
import PageTransition from "@/src/components/ui/PageTransition";

export default function Template({ children }) {
  const pathname = usePathname();
  return <PageTransition keyId={pathname}>{children}</PageTransition>;
}
