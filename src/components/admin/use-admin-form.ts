"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import type { ActionResult } from "@/lib/admin/action-result";

const unreachable = "Gagal menyimpan. Periksa koneksi internet, lalu coba lagi.";

/**
 * Runs a server action and shows its outcome as a toast, success or failure. A save that never answers (offline,
 * server crash) gets a failure toast too. Returns null when there's no result to act on.
 */
export async function runAction(action: () => Promise<ActionResult>, successMessage = "Tersimpan."): Promise<ActionResult | null> {
  let outcome: ActionResult | undefined;
  try {
    outcome = await action();
  } catch {
    toast.error(unreachable);
    return null;
  }
  // No result: the action sent the browser elsewhere, such as to the login page after the session ran out.
  if (!outcome) return null;
  if (outcome.ok) toast.success(outcome.message ?? successMessage);
  else toast.error(outcome.error);
  return outcome;
}

type Options = {
  successMessage?: string;
  onSuccess?: () => void;
};

// Submits a form to a server action without React's automatic form reset, so a failed save keeps
// everything the client typed. Shows the outcome as a toast and keeps field errors for the inputs.
export function useAdminForm(action: (formData: FormData) => Promise<ActionResult>, { successMessage, onSuccess }: Options = {}) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const outcome = await runAction(() => action(formData), successMessage);
      setResult(outcome);
      if (!outcome?.ok) return;
      onSuccess?.();
      // A new record gets its own page; the toast stays up across the move.
      if (outcome.redirectTo) router.push(outcome.redirectTo);
    });
  }

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  return { onSubmit, pending, fieldErrors, result };
}
