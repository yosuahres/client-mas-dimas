import type { Metadata } from "next";

import { UsersManager } from "@/app/admin/(panel)/users/users-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { isAdmin, requireAdmin } from "@/lib/admin/session";
import { createServiceClient } from "@/lib/supabase/clients";

export const metadata: Metadata = { title: "Admin users" };

export default async function UsersPage() {
  const { user } = await requireAdmin();

  if (!process.env.SUPABASE_SECRET_KEY) {
    return (
      <>
        <PageHeader title="Admin users" />
        <PageBody width="max-w-2xl">
          <p className="rounded-xl border px-4 py-6 text-sm text-muted-foreground">
            Managing admins needs the <code className="rounded bg-muted px-1">SUPABASE_SECRET_KEY</code> setting on the
            server. Until it&apos;s set, add admins in the Supabase dashboard (see docs/admin.md).
          </p>
        </PageBody>
      </>
    );
  }

  const { data, error } = await createServiceClient().auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(`Couldn't list the admins: ${error.message}`);
  const admins = data.users
    .filter(isAdmin)
    .map((account) => ({ id: account.id, email: account.email ?? "", lastSignIn: account.last_sign_in_at ?? null }))
    .toSorted((a, b) => a.email.localeCompare(b.email));

  return (
    <>
      <PageHeader title="Admin users" />
      <PageBody width="max-w-2xl">
        <p className="mb-4 text-sm text-muted-foreground">Everyone who can sign in to this admin panel.</p>
        <UsersManager admins={admins} currentUserId={user.id} />
      </PageBody>
    </>
  );
}
