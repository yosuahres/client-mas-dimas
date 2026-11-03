"use client";

import { saveSettings } from "@/app/admin/(panel)/settings/actions";
import { FormSection, SaveBar, TextAreaField, TextField } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { SiteSettings } from "@/lib/content/schema";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveSettings);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Contact" description="Shown in the footer, and used for every WhatsApp button on the site.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="businessName" label="Business name" defaultValue={settings?.businessName} errors={errors} />
          <TextField
            name="whatsappNumber"
            label="WhatsApp number"
            inputMode="tel"
            defaultValue={settings?.whatsappNumber}
            errors={errors}
            hint="International format without +, e.g. 628112653767."
          />
          <TextField name="phoneDisplay" label="Phone number as shown" defaultValue={settings?.phoneDisplay} errors={errors} hint="e.g. +62 811 2653 767" />
          <TextField name="email" label="Email" type="email" defaultValue={settings?.email} errors={errors} />
        </div>
        <TextAreaField name="address" label="Address" rows={2} defaultValue={settings?.address} errors={errors} />
      </FormSection>

      <FormSection title="Links and rating">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="googleRating" label="Google rating" inputMode="decimal" defaultValue={settings?.googleRating} errors={errors} hint="Copy it from your Google Business Profile, e.g. 4.9." />
          <TextField name="googleReviewsUrl" label="Google reviews link" type="url" defaultValue={settings?.googleReviewsUrl} errors={errors} />
          <TextField name="instagramUrl" label="Instagram link" type="url" defaultValue={settings?.instagramUrl} errors={errors} />
          <TextField name="siteUrl" label="Website address" type="url" defaultValue={settings?.siteUrl} errors={errors} hint="Used in links shared on social media." />
        </div>
      </FormSection>

      <FormSection title="Prices" description="Foreign guests see a rough US dollar price next to each rupiah price.">
        <TextField
          name="idrPerUsd"
          label="Rupiah per US dollar"
          inputMode="numeric"
          defaultValue={settings?.idrPerUsd}
          errors={errors}
          hint="Update it now and then, e.g. 16500."
          className="max-w-xs"
        />
      </FormSection>

      <SaveBar pending={pending} />
    </form>
  );
}
