"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Full-screen "magical" loading experience shown while a wallpaper generates:
 * floating AI particles, a pulsing orb, a shimmering progress bar, and cycling
 * status messages. Purely presentational — driven by the `show` prop.
 */

const STATUS_MESSAGES = [
  "Reading your device profile…",
  "Analyzing composition…",
  "Mapping safe zones & cutouts…",
  "Optimizing for your screen…",
  "Generating artwork…",
  "Adding the finishing touches…",
];

function Particles() {
  // Deterministic-ish particle field; regenerated once per mount.
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.left}%`, width: p.size, height: p.size }}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "-10%", opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function GenerationOverlay({ show }: { show: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!show) {
      setStep(0);
      return;
    }
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, STATUS_MESSAGES.length - 1)),
      1100,
    );
    return () => clearInterval(id);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-2xl"
        >
          <Particles />

          {/* Pulsing orb */}
          <motion.div
            className="relative grid h-32 w-32 place-items-center"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-soft blur-2xl" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-soft text-3xl shadow-2xl">
              ✨
            </div>
          </motion.div>

          {/* Status message */}
          <div className="mt-8 h-6 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-white/80"
              >
                {STATUS_MESSAGES[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Shimmer progress bar */}
          <div className="relative mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent-soft"
              initial={{ width: "8%" }}
              animate={{ width: ["8%", "70%", "92%"] }}
              transition={{ duration: 6, ease: "easeOut" }}
            />
            <div className="shimmer absolute inset-0" />
          </div>

          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
            WallpaperForge AI
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
