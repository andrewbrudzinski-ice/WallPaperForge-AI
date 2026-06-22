"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";

/** The (non-standard but widely supported) install prompt event. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "wpf-install-dismissed";

/**
 * Tasteful, glassy "Add to Home Screen" banner. Appears only when the browser
 * fires `beforeinstallprompt`, the app isn't already installed, and the user
 * hasn't dismissed it before. Sits just above the bottom nav.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && deferred && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="safe-bottom pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4"
        >
          <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-3xl border border-white/15 bg-black/60 p-3 pl-4 shadow-2xl backdrop-blur-2xl">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-soft">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Install WallpaperForge</div>
              <div className="truncate text-xs text-white/55">
                Full-screen, faster, works offline.
              </div>
            </div>
            <button
              onClick={install}
              className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-br from-accent to-accent-soft px-4 py-2 text-sm font-semibold text-white active:scale-95"
            >
              <Download className="h-4 w-4" /> Install
            </button>
            <button
              onClick={dismiss}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white/50 hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
