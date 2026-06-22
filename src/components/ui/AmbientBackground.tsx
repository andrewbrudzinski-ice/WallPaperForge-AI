"use client";

import { motion } from "framer-motion";

/**
 * Slow-drifting blurred color blobs behind all content. Gives the app the
 * living, premium "Arc / Linear" feel without distracting from the UI. Fixed
 * and pointer-events-none so it never interferes with interaction.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-24 h-[42vh] w-[42vh] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle,#7c5cff,transparent 70%)" }}
        animate={{ x: [0, 40, -20, 0], y: [0, 30, 60, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-15%] top-[10%] h-[38vh] w-[38vh] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle,#38bdf8,transparent 70%)" }}
        animate={{ x: [0, -30, 20, 0], y: [0, 50, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] h-[40vh] w-[40vh] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle,#ec4899,transparent 70%)" }}
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 10, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
