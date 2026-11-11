import type { Metadata } from "next";

import { UsersManager } from "@/app/admin/(settings)/settings/users/users-manager";
import { isAdmin, requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/clients";

export const metadata: Metadata = { title: "Admin users" };

export default async function UsersPage() {
  const { user } = await requireAdmin();

  if (!process.env.SUPABASE_SECRET_KEY) {
    return (
      <p className="rounded-xl border px-4 py-6 text-sm text-muted-foreground">
        Managing admins needs the <code className="rounded bg-muted px-1">SUPABASE_SECRET_KEY</code> setting on the
        server. Until it&apos;s set, add admins in the Supabase dashboard (see docs/admin.md).
      </p>
    );
  }

  const { data, error } = await createServiceClient().auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(`Couldn't list the admins: ${error.message}`);
  const admins = data.users
    .filter(isAdmin)
    .map((account) => ({ id: account.id, email: account.email ?? "", lastSignIn: account.last_sign_in_at ?? null }))
    .toSorted((a, b) => a.email.localeCompare(b.email));

  return <UsersManager admins={admins} currentUserId={user.id} />;
}
