// Supabase settings from the environment (see .env.example).
// Until they're set, the public site shows the built-in content and /admin shows setup steps.

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase isn't configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return config;
}
