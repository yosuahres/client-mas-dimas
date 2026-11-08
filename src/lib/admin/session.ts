import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { createSessionClient } from "@/lib/supabase/clients";
import { supabaseConfig } from "@/lib/supabase/config";

// Who may use /admin: a Supabase user whose app_metadata.role is "admin". Only the service role can set
// app_metadata, so a visitor can't grant it to themselves; the database's row-level security checks the same claim.

export function isAdmin(user: Pick<User, "app_metadata">) {
  return user.app_metadata?.role === "admin";
}

type SessionClient = Awaited<ReturnType<typeof createSessionClient>>;

// One client per request, shared by the session check and the reads.
const sessionClient = cache(async () => {
  // Never during a prerender or prefetch: the Supabase client reads the clock while loading the session.
  await connection();
  // The login page shows the setup steps until Supabase is configured.
  if (!supabaseConfig()) redirect("/admin/login");
  return createSessionClient();
});

/**
 * The signed-in admin and a Supabase client acting as them. Redirects to the login page otherwise.
 * Asks the Auth server rather than trusting the cookie, so a removed admin is locked out straight away;
 * that round trip happens once per request however many components and queries call this.
 */
export const requireAdmin = cache(async () => {
  const supabase = await sessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  if (!isAdmin(user)) redirect("/admin/login?error=not-admin");
  return { supabase, user };
});

/**
 * Runs a read as the signed-in admin alongside the session check instead of after it, saving a round trip.
 * Row-level security already limits what a non-admin could read, and the result is only returned once the check passes.
 */
export async function readAsAdmin<T>(read: (supabase: SessionClient) => PromiseLike<T>): Promise<T> {
  const supabase = await sessionClient();
  const [, result] = await Promise.all([requireAdmin(), read(supabase)]);
  return result;
}
