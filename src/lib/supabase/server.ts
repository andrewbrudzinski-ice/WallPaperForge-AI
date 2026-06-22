import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase clients for use in API routes and server components.
 *
 * - `getServerSupabase()` uses the anon key + request cookies (RLS-scoped to
 *   the signed-in user).
 * - `getServiceSupabase()` uses the service-role key for privileged server-only
 *   work (e.g. counting usage, inserting on behalf of a user). NEVER import this
 *   into client code.
 *
 * Both return null when env vars are missing so callers can fall back to a
 * keyless/offline mode.
 */
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component without a mutable cookie store —
          // safe to ignore when middleware refreshes sessions.
        }
      },
    },
  });
}

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
