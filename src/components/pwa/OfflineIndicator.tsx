"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";

/**
 * Subtle banner shown when the device goes offline, so users understand why
 * generation is unavailable. Saved wallpapers/favorites still work (local
 * store), which the copy reassures.
 */
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="safe-top pointer-events-none fixed inset-x-0 top-0 z-[55] flex justify-center px-4 pt-2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur-xl">
            <WifiOff className="h-3.5 w-3.5" />
            You&apos;re offline — saved wallpapers still work.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
