"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/clients";

const newAdmin = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(10, "Use at least 10 characters."),
});

/** Creates a confirmed account with the admin role. Share the password with them; they can change it in My account. */
export async function addAdmin(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newAdmin.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await createServiceClient().auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "admin" },
  });
  if (error?.code === "email_exists") return failure("There's already an account with that email.");
  if (error) return failure(`Couldn't add the admin: ${error.message}`);

  refresh();
  return { ok: true, message: `${parsed.data.email} can now sign in.` };
}

/** Deletes another admin's account. Their open session stops working in the admin panel straight away. */
export async function removeAdmin(userId: string): Promise<ActionResult> {
  const { user } = await requireAdmin();
  if (userId === user.id) return failure("You can't remove your own account.");

  const { error } = await createServiceClient().auth.admin.deleteUser(userId);
  if (error) return failure(`Couldn't remove the admin: ${error.message}`);

  refresh();
  return { ok: true, message: "Admin removed." };
}
