"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds an interactive hover/press treatment. */
  interactive?: boolean;
}

/** Glassmorphism surface used throughout the app. */
export function GlassCard({
  className,
  interactive,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)]",
        interactive &&
          "cursor-pointer transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1] active:scale-[0.99]",
        className,
      )}
      {...props}
    />
  );
}
