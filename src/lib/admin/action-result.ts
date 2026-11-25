import type { z } from "zod";

// What every admin server action returns to its form.
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function failure(error: string, fieldErrors?: Record<string, string>): ActionResult {
  return { ok: false, error, fieldErrors };
}

/** One message per field, keyed by the field's dotted path ("text.fr.name"), from a failed zod parse. */
export function invalid(error: z.ZodError): ActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    fieldErrors[key] ??= issue.message;
  }
  return failure("Ada isian yang perlu diperbaiki.", fieldErrors);
}

/** Postgres errors in words the client can act on. */
export function databaseFailure(error: { code?: string; message: string }, what: string): ActionResult {
  if (error.code === "23505") return failure(`Sudah ada ${what} dengan nama pendek ini. Pakai nama pendek (URL) lain.`);
  if (error.code === "42501") return failure("Akun Anda tidak diizinkan mengubah ini.");
  return failure(`Gagal menyimpan ${what}: ${error.message}`);
}
