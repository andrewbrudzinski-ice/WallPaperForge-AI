"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Heart, Clock, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/generate", label: "Create", icon: Sparkles },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/history", label: "History", icon: Clock },
  { href: "/device", label: "Device", icon: Smartphone },
];

/** Native-app-style glass bottom tab bar (mobile-first; floats on desktop). */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom sticky bottom-0 z-40 mt-auto px-4 pb-2 pt-2">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-3xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-2xl">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors",
                active ? "text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110 drop-shadow-[0_0_8px_rgba(124,92,255,0.6)]",
                )}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
