"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export type FieldErrors = Record<string, string>;

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-[13px]">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<typeof Input>, "name"> & {
  name: string;
  label: string;
  hint?: ReactNode;
  errors: FieldErrors;
};

export function TextField({ name, label, hint, errors, className, ...input }: TextFieldProps) {
  const error = errors[name];
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} className={className}>
      <Input id={name} name={name} aria-invalid={error ? true : undefined} {...input} />
    </Field>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<typeof Textarea>, "name"> & {
  name: string;
  label: string;
  hint?: ReactNode;
  errors: FieldErrors;
};

export function TextAreaField({ name, label, hint, errors, className, ...textarea }: TextAreaFieldProps) {
  const error = errors[name];
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} className={className}>
      <Textarea id={name} name={name} aria-invalid={error ? true : undefined} {...textarea} />
    </Field>
  );
}

export type SelectOption = { value: string; label: string };

type SelectFieldProps = {
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  hint?: ReactNode;
  errors: FieldErrors;
  className?: string;
};

/** Radix select (no native <select>), which still submits with the form under its name. */
export function SelectField({ name, label, options, defaultValue, placeholder, hint, errors, className }: SelectFieldProps) {
  const error = errors[name];
  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} className={className}>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger id={name} className="w-full" aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

type SwitchFieldProps = {
  name: string;
  label: string;
  hint?: ReactNode;
  defaultChecked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/** A switch that submits "on" when on and nothing when off, like a checkbox. */
export function SwitchField({ name, label, hint, defaultChecked, onCheckedChange }: SwitchFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border px-3 py-2.5">
      <div className="grid gap-0.5">
        <Label htmlFor={name} className="text-[13px]">
          {label}
        </Label>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <Switch id={name} name={name} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// The client writes in Indonesian; English and French are translated from it on save.
const tabOrder: Locale[] = ["id", "en", "fr"];
const localeLabels: Record<Locale, string> = { id: "Indonesia", en: "English", fr: "Français" };

/** Placeholder for an empty English or French field. */
export const autoTranslatedPlaceholder = "Translated from the Indonesian when you save";

/**
 * One tab per language for translated fields, Indonesian first. Every tab stays in the page (hidden, not
 * unmounted) so all three languages are submitted together; a dot marks a tab with an error.
 */
export function LocaleTabs({ errors, prefixes, children }: { errors: FieldErrors; prefixes: string[]; children: (locale: Locale) => ReactNode }) {
  const hasError = (locale: Locale) =>
    Object.keys(errors).some((key) => prefixes.some((prefix) => key.startsWith(`${prefix}.${locale}`)));

  return (
    <Tabs defaultValue="id">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          {tabOrder.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="gap-1.5 text-[13px]">
              {localeLabels[locale]}
              {locale === "id" ? null : <span className="text-[10px] font-normal text-muted-foreground">auto</span>}
              {hasError(locale) ? <span aria-label="has errors" className="size-1.5 rounded-full bg-destructive" /> : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <p className="text-xs text-muted-foreground">Write in Indonesian. English and French are translated when you save.</p>
      </div>
      {tabOrder.map((locale) => (
        <TabsContent key={locale} value={locale} forceMount className="mt-4 data-[state=inactive]:hidden">
          {locale === "id" ? null : (
            <p className="mb-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Translated automatically from the Indonesian each time it changes. Edit here only to correct the translation;
              your correction stays until the Indonesian changes again.
            </p>
          )}
          {children(locale)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** A titled block of fields inside a form, in the bordered-panel style of the CRM. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 p-4">{children}</div>
    </section>
  );
}

/** The save bar pinned to the bottom of a long form. */
export function SaveBar({ pending, label = "Save changes", children }: { pending: boolean; label?: string; children?: ReactNode }) {
  return (
    <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : label}
      </Button>
    </div>
  );
}
