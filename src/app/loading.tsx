import { Sparkles } from "lucide-react";

/** Root loading fallback shown during route transitions / data fetches. */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4">
      <div className="relative grid h-16 w-16 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-soft shadow-xl">
          <Sparkles className="h-7 w-7 text-white" />
        </span>
      </div>
      <p className="text-sm font-medium text-white/40">Loading…</p>
    </div>
  );
}
