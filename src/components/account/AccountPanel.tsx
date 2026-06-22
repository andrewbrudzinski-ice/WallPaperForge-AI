"use client";

import { useState } from "react";
import { Cloud, CloudOff, LogOut, Mail, Loader2, Check } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

/**
 * Account + cloud-sync surface on the Profile screen. Adapts to three states:
 * not configured (local-only), signed out (email/password form), and signed in
 * (account + sign out). Never blocks the app — sync is purely additive.
 */
export function AccountPanel() {
  const { configured, user, loading, error, signIn, signUp, signOut, clearError } =
    useAuthContext();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Local-only mode — Supabase not configured.
  if (!configured) {
    return (
      <GlassCard className="flex items-start gap-3 p-4">
        <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-white/50" />
        <div className="text-sm">
          <div className="font-semibold">Local mode</div>
          <p className="mt-1 text-white/50">
            Your wallpapers, favorites, and history are saved on this device. Add
            Supabase keys to enable accounts and cloud sync across devices.
          </p>
        </div>
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard className="flex items-center gap-3 p-4 text-sm text-white/60">
        <Loader2 className="h-5 w-5 animate-spin" /> Checking session…
      </GlassCard>
    );
  }

  // Signed in.
  if (user) {
    return (
      <GlassCard className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400/30 to-sky-500/30">
            <Cloud className="h-5 w-5 text-emerald-300" />
          </span>
          <div className="text-sm">
            <div className="flex items-center gap-1.5 font-semibold">
              Synced <Check className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="text-white/50">{user.email}</div>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </GlassCard>
    );
  }

  // Signed out — auth form.
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password);
    setBusy(false);
    if (ok && mode === "signin") {
      setEmail("");
      setPassword("");
    }
  }

  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Cloud className="h-5 w-5 text-accent" />
        <h3 className="font-semibold">
          {mode === "signin" ? "Sign in to sync" : "Create an account"}
        </h3>
      </div>

      <form onSubmit={submit} className="space-y-2.5">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3">
          <Mail className="h-4 w-4 text-white/40" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            placeholder="you@email.com"
            className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30"
          />
        </div>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
          placeholder="Password (min 6 chars)"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none ring-accent/40 placeholder:text-white/30 focus:ring-2"
        />

        {error && (
          <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <button
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          clearError();
        }}
        className="mt-3 w-full text-center text-xs text-white/50 hover:text-white/80"
      >
        {mode === "signin"
          ? "No account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </GlassCard>
  );
}
