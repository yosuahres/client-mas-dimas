"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { failure, type ActionResult } from "@/lib/admin/action-result";
import { isAdmin } from "@/lib/admin/session";
import { createSessionClient } from "@/lib/supabase/clients";

const credentials = z.object({
  email: z.email("Enter your email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function signIn(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return failure(parsed.error.issues[0].message);

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return failure("That email and password don't match an admin account.");
  if (!isAdmin(data.user)) {
    await supabase.auth.signOut();
    return failure("This account isn't an admin. Ask the site owner to give you access.");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
