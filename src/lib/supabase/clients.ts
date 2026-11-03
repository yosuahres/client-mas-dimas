import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { requireSupabaseConfig } from "@/lib/supabase/config";

/** Reads what any visitor may see. No cookies, so it's safe inside "use cache". */
export function createPublicClient() {
  const { url, anonKey } = requireSupabaseConfig();
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Acts as the signed-in admin, so row-level security decides what they may change. */
export async function createSessionClient() {
  // Cookies first: it marks the caller as request-time, so admin pages aren't run at build.
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseConfig();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        // Server Components can't set cookies; the proxy refreshes the session on the next request instead.
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {}
      },
    },
  });
}

/** Bypasses row-level security. Only for managing admin accounts, after requireAdmin(). */
export function createServiceClient() {
  const { url } = requireSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY isn't set");
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
