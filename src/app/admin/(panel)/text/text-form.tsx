"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { saveText } from "@/app/admin/(panel)/text/actions";
import { SaveBar } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type TextField = {
  key: string;
  /** The text in the dictionary file. */
  original: string;
  /** The saved edit, if any. */
  saved: string | null;
  /** The Indonesian it's translated from, shown under English and French fields. */
  indonesian: string | null;
};

/** "plan.facts.0.label" → "Facts · #1 · label" (the section name is already in the page title). */
function fieldLabel(key: string) {
  const label = key
    .split(".")
    .slice(1)
    .map((part) => (/^\d+$/.test(part) ? `#${Number(part) + 1}` : part.replace(/([A-Z])/g, " $1").toLowerCase()))
    .join(" · ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function TextForm({ locale, section, fields }: { locale: string; section: string; fields: TextField[] }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveText.bind(null, locale, section));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {fields.map((field) => (
        <TextRow key={field.key} field={field} error={errors[`text:${field.key}`]} />
      ))}
      <SaveBar pending={pending} />
    </form>
  );
}

function TextRow({ field, error }: { field: TextField; error?: string }) {
  const [value, setValue] = useState(field.saved ?? field.original);
  const name = `text:${field.key}`;
  const edited = value !== field.original;

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor={name} className="text-[13px]">
          {fieldLabel(field.key)}
        </Label>
        {edited ? (
          <>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
              Edited
            </Badge>
            <button
              type="button"
              onClick={() => setValue(field.original)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Reset to original
            </button>
          </>
        ) : null}
      </div>
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={Math.min(6, Math.max(1, Math.ceil(value.length / 90)))}
        aria-invalid={error ? true : undefined}
        className="min-h-9 resize-y"
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : field.indonesian ? (
        <p className="text-xs text-muted-foreground">Indonesian: {field.indonesian}</p>
      ) : null}
    </div>
  );
}
