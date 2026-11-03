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
  return failure("Some fields need fixing.", fieldErrors);
}

/** Postgres errors in words the client can act on. */
export function databaseFailure(error: { code?: string; message: string }, what: string): ActionResult {
  if (error.code === "23505") return failure(`That ${what} already exists. Use a different short name (URL).`);
  if (error.code === "42501") return failure("Your account isn't allowed to change this.");
  return failure(`Couldn't save the ${what}: ${error.message}`);
}
