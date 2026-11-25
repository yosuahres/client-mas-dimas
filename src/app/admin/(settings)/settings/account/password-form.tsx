"use client";

import { useState } from "react";

import { changePassword } from "@/app/admin/(settings)/settings/account/actions";
import { FormSection, TextField } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  // Remounted after a change, so the fields clear.
  const [formKey, setFormKey] = useState(0);
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(changePassword, { onSuccess: () => setFormKey((key) => key + 1) });

  return (
    <form key={formKey} onSubmit={onSubmit} noValidate>
      <FormSection title="Ganti kata sandi">
        <TextField name="current" label="Kata sandi saat ini" type="password" autoComplete="current-password" errors={errors} />
        <TextField name="password" label="Kata sandi baru" type="password" autoComplete="new-password" errors={errors} hint="Minimal 10 karakter." />
        <TextField name="confirm" label="Ulangi kata sandi baru" type="password" autoComplete="new-password" errors={errors} />
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan…" : "Ganti kata sandi"}
          </Button>
        </div>
      </FormSection>
    </form>
  );
}
