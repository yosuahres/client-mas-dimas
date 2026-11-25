"use server";

import { z } from "zod";

import { failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { requireAdmin } from "@/lib/admin/session";
import { createPublicClient } from "@/lib/supabase/clients";

const passwordInput = z
  .object({
    current: z.string().min(1, "Isi kata sandi Anda saat ini."),
    // bcrypt, which Supabase Auth uses, ignores everything after 72 bytes.
    password: z.string().min(10, "Minimal 10 karakter.").max(72, "Maksimal 72 karakter."),
    confirm: z.string(),
  })
  .refine((input) => input.password === input.confirm, { path: ["confirm"], message: "Kedua kata sandi tidak sama." })
  .refine((input) => input.password !== input.current, { path: ["password"], message: "Pilih kata sandi yang berbeda dari yang sekarang." });

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
  if (!user.email) return failure("Akun ini tidak punya alamat email untuk memeriksa kata sandi.");
  const { error: wrongPassword } = await createPublicClient().auth.signInWithPassword({ email: user.email, password: parsed.data.current });
  if (wrongPassword) return failure("Ada isian yang perlu diperbaiki.", { current: "Itu bukan kata sandi Anda saat ini." });

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return failure(`Gagal mengganti kata sandi: ${error.message}`);

  // Whoever else was signed in as this account (another device, or someone who shouldn't be) is signed out.
  const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });
  if (signOutError) console.error("The password changed, but other sessions couldn't be signed out.", signOutError);
  return { ok: true, message: "Kata sandi diganti. Perangkat lain sudah dikeluarkan." };
}
