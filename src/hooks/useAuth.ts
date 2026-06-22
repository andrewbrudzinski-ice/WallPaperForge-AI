"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthState {
  /** Whether Supabase credentials are present at all. */
  configured: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Email/password auth on top of the browser Supabase client. When Supabase
 * isn't configured, returns a stable "not configured" state so the UI can show
 * a local-only experience without errors.
 */
export function useAuth(): AuthState {
  const configured = isSupabaseConfigured();
  const sb = useMemo(() => getBrowserSupabase(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sb) {
      setLoading(false);
      return;
    }
    let active = true;
    sb.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!sb) return false;
      setError(null);
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return false;
      }
      return true;
    },
    [sb],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!sb) return false;
      setError(null);
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        return false;
      }
      // If email confirmation is disabled, a session is returned immediately.
      if (!data.session) {
        setError("Check your email to confirm your account, then sign in.");
      }
      return true;
    },
    [sb],
  );

  const signOut = useCallback(async () => {
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
  }, [sb]);

  const clearError = useCallback(() => setError(null), []);

  return { configured, user, loading, error, signIn, signUp, signOut, clearError };
}
