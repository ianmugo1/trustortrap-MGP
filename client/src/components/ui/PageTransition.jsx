"use client";
import { motion } from "framer-motion";

export default function PageTransition({ children, keyId }) {
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.div>
  );
}
