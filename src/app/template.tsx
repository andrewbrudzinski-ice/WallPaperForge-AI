"use client";

import { motion } from "framer-motion";

/**
 * App Router `template` re-mounts on every navigation, giving us a clean,
 * subtle page-transition (fade + slight rise) across the whole app without
 * wiring per-page animation. Kept short and non-distracting per the design
 * guidelines.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex min-h-screen flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
