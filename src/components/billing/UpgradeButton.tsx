"use client";

import { useState } from "react";
import { Crown, Loader2, Settings } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useAppStore } from "@/store/app-store";
import { isBillingEnabledClient } from "@/lib/billing/config";
import { Button } from "@/components/ui/Button";

/**
 * Real billing controls, shown only when Stripe is enabled
 * (NEXT_PUBLIC_BILLING_ENABLED). Otherwise renders nothing so the dev
 * "simulate" toggle on the Profile screen stays visible.
 */
export function UpgradeButton() {
  const enabled = isBillingEnabledClient();
  const { configured, user } = useAuthContext();
  const tier = useAppStore((s) => s.tier);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  async function go(path: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured || !user) {
    return (
      <p className="mt-2 text-center text-xs text-white/50">
        Sign in to upgrade to Premium.
      </p>
    );
  }

  return (
    <div className="mt-2">
      {tier === "premium" ? (
        <Button
          variant="secondary"
          className="w-full"
          disabled={busy}
          onClick={() => go("/api/billing/portal")}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
          Manage billing
        </Button>
      ) : (
        <Button className="w-full" disabled={busy} onClick={() => go("/api/billing/checkout")}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
          Upgrade to Premium
        </Button>
      )}
      {error && <p className="mt-2 text-center text-xs text-rose-300">{error}</p>}
    </div>
  );
}
