"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Entry router. Sends first-time users to onboarding and returning users
 * straight to the generation screen. Device selection is persisted, so this
 * decision is stable across launches.
 */
export default function Home() {
  const router = useRouter();
  const onboarded = useAppStore((s) => s.onboarded);
  const device = useAppStore((s) => s.device);

  useEffect(() => {
    // Wait a tick for the persisted store to hydrate.
    const id = setTimeout(() => {
      router.replace(onboarded && device ? "/generate" : "/onboarding");
    }, 50);
    return () => clearTimeout(id);
  }, [onboarded, device, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Sparkles className="h-7 w-7 text-accent" />
        WallpaperForge
      </div>
      <Spinner />
    </div>
  );
}
