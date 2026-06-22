"use client";

import { AuthProvider } from "./AuthProvider";
import { useSync } from "@/hooks/useSync";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

/** Runs the global cloud-sync effect inside the auth context. */
function SyncRunner({ children }: { children: React.ReactNode }) {
  useSync();
  return <>{children}</>;
}

/**
 * Top-level client providers. Mounted once in the root layout so auth, cloud
 * sync, and PWA features run app-wide. Auth + sync are inert without Supabase
 * credentials, preserving the zero-config local experience.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SyncRunner>{children}</SyncRunner>
      <ServiceWorkerRegister />
      <InstallPrompt />
    </AuthProvider>
  );
}
