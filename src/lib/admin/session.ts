import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createSessionClient } from "@/lib/supabase/clients";
import { supabaseConfig } from "@/lib/supabase/config";

// Who may use /admin: a Supabase user whose app_metadata.role is "admin". Only the service role can set
// app_metadata, so a visitor can't grant it to themselves; the database's row-level security checks the same claim.

export function isAdmin(user: Pick<User, "app_metadata">) {
  return user.app_metadata?.role === "admin";
}

/** The signed-in admin and a Supabase client acting as them. Redirects to the login page otherwise. */
export async function requireAdmin() {
  // Never during a prerender or prefetch: the Supabase client reads the clock while loading the session.
  await connection();
  // The login page shows the setup steps until Supabase is configured.
  if (!supabaseConfig()) redirect("/admin/login");
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  if (!isAdmin(user)) redirect("/admin/login?error=not-admin");
  return { supabase, user };
}
