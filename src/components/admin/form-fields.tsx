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

/** A dashed box under fields that shows, as they're typed, what guests will see. */
export function GuestExample({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 text-sm", className)} aria-live="polite">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, className, children }: FieldProps) {
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
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<typeof Input>, "name"> & {
  name: string;
  label: string;
  errors: FieldErrors;
};

export function TextField({ name, label, errors, className, ...input }: TextFieldProps) {
  const error = errors[name];
  return (
    <Field label={label} htmlFor={name} error={error} className={className}>
      <Input id={name} name={name} aria-invalid={error ? true : undefined} {...input} />
    </Field>
  );
}

type TextAreaFieldProps = Omit<ComponentProps<typeof Textarea>, "name"> & {
  name: string;
  label: string;
  errors: FieldErrors;
};

export function TextAreaField({ name, label, errors, className, ...textarea }: TextAreaFieldProps) {
  const error = errors[name];
  return (
    <Field label={label} htmlFor={name} error={error} className={className}>
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
  errors: FieldErrors;
  className?: string;
  onValueChange?: (value: string) => void;
};

/** Radix select (no native <select>), which still submits with the form under its name. */
export function SelectField({ name, label, options, defaultValue, placeholder, errors, className, onValueChange }: SelectFieldProps) {
  const error = errors[name];
  return (
    <Field label={label} htmlFor={name} error={error} className={className}>
      <Select name={name} defaultValue={defaultValue} onValueChange={onValueChange}>
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
  defaultChecked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/** A switch that submits "on" when on and nothing when off, like a checkbox. */
export function SwitchField({ name, label, defaultChecked, onCheckedChange }: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5">
      <Label htmlFor={name} className="text-[13px]">
        {label}
      </Label>
      <Switch id={name} name={name} defaultChecked={defaultChecked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// The client writes in Indonesian; English and French are translated from it on save.
const tabOrder: Locale[] = ["id", "en", "fr"];
const localeLabels: Record<Locale, string> = { id: "Indonesia", en: "Inggris", fr: "Prancis" };

/** Placeholder for an empty English or French field. */
export const autoTranslatedPlaceholder = "Diterjemahkan dari bahasa Indonesia saat disimpan";

/**
 * One tab per language for translated fields, Indonesian first. Every tab stays in the page (hidden, not
 * unmounted) so all three languages are submitted together; a dot marks a tab with an error.
 */
export function LocaleTabs({ errors, prefixes, children }: { errors: FieldErrors; prefixes: string[]; children: (locale: Locale) => ReactNode }) {
  const hasError = (locale: Locale) =>
    Object.keys(errors).some((key) => prefixes.some((prefix) => key.startsWith(`${prefix}.${locale}`)));

  return (
    <Tabs defaultValue="id">
      <TabsList className="w-full sm:w-fit">
        {tabOrder.map((locale) => (
          <TabsTrigger key={locale} value={locale} className="flex-1 gap-1.5 text-[13px] sm:flex-none">
            {localeLabels[locale]}
            {locale === "id" ? null : <span className="hidden text-[10px] font-normal text-muted-foreground sm:inline">otomatis</span>}
            {hasError(locale) ? <span aria-label="ada kesalahan" className="size-1.5 rounded-full bg-destructive" /> : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabOrder.map((locale) => (
        <TabsContent key={locale} value={locale} forceMount className="mt-4 data-[state=inactive]:hidden">
          {children(locale)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** A titled block of fields inside a form, in the bordered-panel style of the CRM. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border">
      <h2 className="border-b px-4 py-3 text-sm font-semibold">{title}</h2>
      <div className="grid gap-4 p-4">{children}</div>
    </section>
  );
}

/**
 * The save bar pinned to the bottom of a long form. Sticky stops at the scroller's padding edge,
 * so the negative bottom and margin cancel PageBody's padding to sit flush with the panel's edge.
 */
export function SaveBar({
  pending,
  label = "Simpan perubahan",
  className,
  children,
}: {
  pending: boolean;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky -bottom-4 z-10 -mx-4 -mb-4 flex items-center justify-end gap-2 border-t bg-background px-4 py-3 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6",
        className,
      )}
    >
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan…" : label}
      </Button>
    </div>
  );
}
