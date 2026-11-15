"use client";

import { MotionConfig } from "motion/react";
import { AuthProvider } from "../context/AuthContext";

export function Providers({ children }) {
  // reducedMotion="user" turns off movement for people who ask their device for less motion
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  );
}
