"use client";

import { Trash2, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";

import { addAdmin, removeAdmin } from "@/app/admin/(settings)/settings/users/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { FormSection, TextField } from "@/components/admin/form-fields";
import { runAction, useAdminForm } from "@/components/admin/use-admin-form";
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
                    Anda
                  </Badge>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {admin.lastSignIn ? `Terakhir masuk ${new Date(admin.lastSignIn).toLocaleDateString("id-ID", { dateStyle: "medium" })}` : "Belum pernah masuk"}
              </p>
            </div>
            {admin.id !== currentUserId ? (
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 text-muted-foreground hover:text-destructive md:size-8"
                aria-label={`Hapus ${admin.email}`}
                onClick={() => setToRemove(admin)}
              >
                <Trash2 />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <form key={formKey} onSubmit={onSubmit} noValidate>
        <FormSection title="Tambah admin">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField name="email" label="Email" type="email" autoComplete="off" errors={errors} />
            <TextField name="password" label="Kata sandi awal" type="text" autoComplete="off" errors={errors} />
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              <UserPlus />
              {pending ? "Menambahkan…" : "Tambah admin"}
            </Button>
          </div>
        </FormSection>
      </form>

      <ConfirmDelete
        open={toRemove !== null}
        onOpenChange={(open) => {
          if (!open) setToRemove(null);
        }}
        title={`Hapus ${toRemove?.email ?? ""}?`}
        description="Akunnya dihapus dan tidak bisa lagi masuk ke panel admin."
        onConfirm={() => {
          const admin = toRemove;
          setToRemove(null);
          if (!admin) return;
          startTransition(async () => {
            await runAction(() => removeAdmin(admin.id));
          });
        }}
      />
    </div>
  );
}
