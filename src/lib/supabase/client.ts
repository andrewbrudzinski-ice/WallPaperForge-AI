"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key). Safe to use in client components for
 * auth and reads/writes governed by Row Level Security.
 *
 * Returns null if Supabase env vars are not set, so the app degrades to a
 * fully local/offline mode (state persisted in the browser) rather than
 * crashing. See `useLibrary` for the local fallback.
 */
export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
