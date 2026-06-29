import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

/** Branded 404 — also shown when a public /w/<slug> wallpaper doesn't exist. */
export default function NotFound() {
  return (
    <>
      <AmbientBackground />
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-accent to-accent-soft shadow-2xl shadow-accent/30">
          <Compass className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Lost in the canvas</h1>
        <p className="mt-2 max-w-xs text-balance text-white/55">
          This page or wallpaper doesn&apos;t exist — it may have been unshared or
          the link is wrong.
        </p>
        <Link
          href="/home"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-accent to-accent-soft px-6 py-3.5 font-semibold text-white shadow-lg shadow-accent/25 active:scale-[0.98]"
        >
          <Home className="h-5 w-5" /> Back home
        </Link>
      </main>
    </>
  );
}
