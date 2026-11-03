import type { Metadata } from "next";

import { PasswordForm } from "@/app/admin/(panel)/account/password-form";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <>
      <PageHeader title="My account" />
      <PageBody width="max-w-xl">
        <p className="mb-5 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>.
        </p>
        <PasswordForm />
      </PageBody>
    </>
  );
}
