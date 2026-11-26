import type { Metadata } from "next";

import { UsersManager } from "@/app/admin/(settings)/settings/users/users-manager";
import { isAdmin, requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/clients";

export const metadata: Metadata = { title: "Pengguna admin" };

export default async function UsersPage() {
  const { user } = await requireAdmin();

  if (!process.env.SUPABASE_SECRET_KEY) {
    return (
      <p className="rounded-xl border px-4 py-6 text-sm text-muted-foreground">
        Menambah admin lain dari sini belum bisa. Minta pembuat website mengaktifkannya.
        <span className="mt-1 block text-xs">Untuk pembuat website: SUPABASE_SECRET_KEY, lihat docs/admin.md.</span>
      </p>
    );
  }

  const { data, error } = await createServiceClient().auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(`Gagal memuat daftar admin: ${error.message}`);
  const admins = data.users
    .filter(isAdmin)
    .map((account) => ({ id: account.id, email: account.email ?? "", lastSignIn: account.last_sign_in_at ?? null }))
    .toSorted((a, b) => a.email.localeCompare(b.email));

  return <UsersManager admins={admins} currentUserId={user.id} />;
}
