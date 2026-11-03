"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/admin/action-result";

type Options = {
  successMessage?: string;
  onSuccess?: () => void;
};

// Submits a form to a server action without React's automatic form reset, so a failed save keeps
// everything the client typed. Shows the outcome as a toast and keeps field errors for the inputs.
export function useAdminForm(action: (formData: FormData) => Promise<ActionResult>, { successMessage = "Saved.", onSuccess }: Options = {}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const outcome = await action(formData);
      setResult(outcome);
      if (outcome.ok) {
        toast.success(outcome.message ?? successMessage);
        onSuccess?.();
      } else {
        toast.error(outcome.error);
      }
    });
  }

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  return { onSubmit, pending, fieldErrors, result };
}
