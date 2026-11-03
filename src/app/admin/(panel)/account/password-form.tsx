"use client";

import { useState } from "react";

import { changePassword } from "@/app/admin/(panel)/account/actions";
import { FormSection, TextField } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  // Remounted after a change, so the fields clear.
  const [formKey, setFormKey] = useState(0);
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(changePassword, { onSuccess: () => setFormKey((key) => key + 1) });

  return (
    <form key={formKey} onSubmit={onSubmit} noValidate>
      <FormSection title="Change password">
        <TextField name="password" label="New password" type="password" autoComplete="new-password" errors={errors} hint="At least 10 characters." />
        <TextField name="confirm" label="New password again" type="password" autoComplete="new-password" errors={errors} />
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Change password"}
          </Button>
        </div>
      </FormSection>
    </form>
  );
}
