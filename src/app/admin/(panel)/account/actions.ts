"use server";

import { z } from "zod";

import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/admin/session";

const passwordInput = z
  .object({
    password: z.string().min(10, "Use at least 10 characters."),
    confirm: z.string(),
  })
  .refine((input) => input.password === input.confirm, { path: ["confirm"], message: "The two passwords don't match." });

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = passwordInput.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return failure(`Couldn't change the password: ${error.message}`);
  return { ok: true, message: "Password changed." };
}
