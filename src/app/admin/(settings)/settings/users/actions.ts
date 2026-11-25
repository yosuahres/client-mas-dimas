"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/clients";

const newAdmin = z.object({
  email: z.email("Isi alamat email yang benar."),
  password: z.string().min(10, "Minimal 10 karakter.").max(72, "Maksimal 72 karakter."),
});

/** Creates a confirmed account with the admin role. Share the password with them; they can change it in Settings → Account. */
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
  if (error?.code === "email_exists") return failure("Sudah ada akun dengan email itu.");
  if (error) return failure(`Gagal menambah admin: ${error.message}`);

  refresh();
  return { ok: true, message: `${parsed.data.email} sekarang bisa masuk.` };
}

/** Deletes another admin's account. Their open session stops working in the admin panel straight away. */
export async function removeAdmin(userId: string): Promise<ActionResult> {
  const { user } = await requireAdmin();
  if (!z.uuid().safeParse(userId).success) return failure("Permintaan tidak valid.");
  if (userId === user.id) return failure("Anda tidak bisa menghapus akun Anda sendiri.");

  const { error } = await createServiceClient().auth.admin.deleteUser(userId);
  if (error) return failure(`Gagal menghapus admin: ${error.message}`);

  refresh();
  return { ok: true, message: "Admin dihapus." };
}
