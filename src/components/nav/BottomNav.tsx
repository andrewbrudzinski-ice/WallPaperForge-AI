"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Sparkles, Heart, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/generate", label: "Create", icon: Sparkles },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/history", label: "History", icon: Clock },
  { href: "/device", label: "Profile", icon: User },
];

/** Premium floating glass tab bar with an animated active pill. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="safe-bottom pointer-events-none sticky bottom-0 z-40 mt-auto px-4 pb-3 pt-2">
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-around rounded-3xl border border-white/10 bg-black/50 p-1.5 shadow-2xl backdrop-blur-2xl">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-medium"
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl bg-white/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "relative h-5 w-5 transition-all",
                  active
                    ? "scale-110 text-white drop-shadow-[0_0_8px_rgba(124,92,255,0.7)]"
                    : "text-white/45",
                )}
              />
              <span className={cn("relative", active ? "text-white" : "text-white/45")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
