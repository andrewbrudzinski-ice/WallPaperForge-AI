"use client";

import { createContext, useContext } from "react";
import { useAuth, type AuthState } from "@/hooks/useAuth";

const AuthContext = createContext<AuthState | null>(null);

/** Provides a single shared auth state (one Supabase listener) to the tree. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}
