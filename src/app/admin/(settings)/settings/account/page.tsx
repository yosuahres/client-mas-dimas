import type { Metadata } from "next";

import { PasswordForm } from "@/app/admin/(settings)/settings/account/password-form";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{user.email}</span>.
      </p>
      <PasswordForm />
    </div>
  );
}
