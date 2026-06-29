"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

/**
 * App-level error boundary. Catches render/runtime errors in route segments and
 * offers a recovery path instead of a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <AmbientBackground />
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-2xl shadow-rose-500/30">
          <AlertTriangle className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 max-w-xs text-balance text-white/55">
          An unexpected error interrupted the forge. Try again — your saved
          wallpapers are safe on this device.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-accent to-accent-soft px-6 py-3.5 font-semibold text-white shadow-lg shadow-accent/25 active:scale-[0.98]"
          >
            <RotateCw className="h-5 w-5" /> Try again
          </button>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 font-semibold backdrop-blur-xl active:scale-[0.98]"
          >
            <Home className="h-5 w-5" /> Home
          </Link>
        </div>
      </main>
    </>
  );
}
