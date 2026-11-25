"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { failure, type ActionResult } from "@/lib/admin/action-result";
import { isAdmin } from "@/lib/admin/session";
import { createSessionClient } from "@/lib/supabase/clients";

const credentials = z.object({
  email: z.email("Isi alamat email Anda."),
  password: z.string().min(1, "Isi kata sandi Anda."),
});

export async function signIn(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return failure(parsed.error.issues[0].message);

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return failure("Email dan kata sandi tidak cocok dengan akun admin mana pun.");
  if (!isAdmin(data.user)) {
    await supabase.auth.signOut();
    return failure("Akun ini bukan admin. Minta pemilik website memberi Anda akses.");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
