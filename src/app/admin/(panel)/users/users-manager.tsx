"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { addAdmin, removeAdmin } from "@/app/admin/(panel)/users/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormSection, TextField } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminAccount = {
  id: string;
  email: string;
  lastSignIn: string | null;
};

export function UsersManager({ admins, currentUserId }: { admins: AdminAccount[]; currentUserId: string }) {
  const [toRemove, setToRemove] = useState<AdminAccount | null>(null);
  const [, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(addAdmin, { onSuccess: () => setFormKey((key) => key + 1) });

  return (
    <div className="grid gap-6">
      <ul className="overflow-hidden rounded-xl border">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium">
                {admin.email}
                {admin.id === currentUserId ? (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                    You
                  </Badge>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {admin.lastSignIn ? `Last signed in ${new Date(admin.lastSignIn).toLocaleDateString("en-GB", { dateStyle: "medium" })}` : "Hasn't signed in yet"}
              </p>
            </div>
            {admin.id !== currentUserId ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={`Remove ${admin.email}`}
                onClick={() => setToRemove(admin)}
              >
                <Trash2 />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <form key={formKey} onSubmit={onSubmit} noValidate>
        <FormSection title="Add an admin" description="They can sign in at /admin straight away. Send them the password privately.">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="email" label="Email" type="email" autoComplete="off" errors={errors} />
            <TextField name="password" label="First password" type="text" autoComplete="off" errors={errors} hint="At least 10 characters. They can change it in My account." />
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              <UserPlus />
              {pending ? "Adding…" : "Add admin"}
            </Button>
          </div>
        </FormSection>
      </form>

      <ConfirmDelete
        open={toRemove !== null}
        onOpenChange={(open) => {
          if (!open) setToRemove(null);
        }}
        title={`Remove ${toRemove?.email ?? ""}?`}
        description="Their account is deleted and they can no longer sign in to the admin panel."
        onConfirm={() => {
          const admin = toRemove;
          setToRemove(null);
          if (!admin) return;
          startTransition(async () => {
            const result = await removeAdmin(admin.id);
            if (result.ok) toast.success(result.message);
            else toast.error(result.error);
          });
        }}
      />
    </div>
  );
}
