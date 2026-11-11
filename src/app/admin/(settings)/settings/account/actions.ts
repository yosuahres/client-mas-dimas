"use server";

import { z } from "zod";

import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/admin/session";
import { createPublicClient } from "@/lib/supabase/clients";

const passwordInput = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    // bcrypt, which Supabase Auth uses, ignores everything after 72 bytes.
    password: z.string().min(10, "Use at least 10 characters.").max(72, "Use at most 72 characters."),
    confirm: z.string(),
  })
  .refine((input) => input.password === input.confirm, { path: ["confirm"], message: "The two passwords don't match." })
  .refine((input) => input.password !== input.current, { path: ["password"], message: "Choose a password you haven't just used." });

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  const parsed = passwordInput.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return invalid(parsed.error);

  // Ask for the current password again: a session left open on a shared computer, or a stolen cookie, must not be
  // enough to take the account over. Checked on a throwaway client so this request's session cookies stay as they are.
  if (!user.email) return failure("This account has no email address to check the password against.");
  const { error: wrongPassword } = await createPublicClient().auth.signInWithPassword({ email: user.email, password: parsed.data.current });
  if (wrongPassword) return failure("Some fields need fixing.", { current: "That isn't your current password." });

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return failure(`Couldn't change the password: ${error.message}`);

  // Whoever else was signed in as this account (another device, or someone who shouldn't be) is signed out.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });
  if (signOutError) console.error("The password changed, but other sessions couldn't be signed out.", signOutError);
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}
