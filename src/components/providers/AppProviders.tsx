"use client";

import { AuthProvider } from "./AuthProvider";
import { useSync } from "@/hooks/useSync";

/** Runs the global cloud-sync effect inside the auth context. */
function SyncRunner({ children }: { children: React.ReactNode }) {
  useSync();
  return <>{children}</>;
}

/**
 * Top-level client providers. Mounted once in the root layout so auth + cloud
 * sync run app-wide. Both are inert without Supabase credentials, preserving
 * the zero-config local experience.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SyncRunner>{children}</SyncRunner>
    </AuthProvider>
  );
}
