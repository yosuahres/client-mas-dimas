"use client";

import { saveSettings } from "@/app/admin/(settings)/settings/business/actions";
import { FormSection, SaveBar, TextAreaField, TextField } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { SiteSettings } from "@/lib/content/schema";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveSettings);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Kontak">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="businessName" label="Nama usaha" defaultValue={settings?.businessName} errors={errors} />
          <TextField
            name="companyName"
            label="Nama perusahaan (di bagian bawah website)"
            placeholder="PT Jogja Transport Sukses Mandiri"
            defaultValue={settings?.companyName}
            errors={errors}
          />
          <TextField
            name="companyUrl"
            label="Website perusahaan"
            type="url"
            placeholder="https://www.jogja-transport.com"
            defaultValue={settings?.companyUrl}
            errors={errors}
          />
          <TextField
            name="whatsappNumber"
            label="Nomor WhatsApp"
            inputMode="tel"
            placeholder="628112653767"
            defaultValue={settings?.whatsappNumber}
            errors={errors}
          />
          <TextField name="phoneDisplay" label="Nomor telepon yang ditampilkan" placeholder="+62 811 2653 767" defaultValue={settings?.phoneDisplay} errors={errors} />
          <TextField name="email" label="Email" type="email" defaultValue={settings?.email} errors={errors} />
        </div>
        <TextAreaField name="address" label="Alamat" rows={2} defaultValue={settings?.address} errors={errors} />
      </FormSection>

      <FormSection title="Link dan rating">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="googleRating" label="Rating Google" inputMode="decimal" placeholder="4.9" defaultValue={settings?.googleRating} errors={errors} />
          <TextField name="googleReviewsUrl" label="Link ulasan Google" type="url" defaultValue={settings?.googleReviewsUrl} errors={errors} />
          <TextField name="instagramUrl" label="Link Instagram" type="url" defaultValue={settings?.instagramUrl} errors={errors} />
          <TextField name="siteUrl" label="Alamat website" type="url" defaultValue={settings?.siteUrl} errors={errors} />
        </div>
      </FormSection>

      <FormSection title="Harga">
        <TextField
          name="idrPerUsd"
          label="Rupiah per dolar AS"
          inputMode="numeric"
          placeholder="16500"
          defaultValue={settings?.idrPerUsd}
          errors={errors}
          className="max-w-xs"
        />
      </FormSection>

      {/* Kept to the settings column instead of running to the panel's edges. */}
      <SaveBar pending={pending} className="mx-0 px-0 sm:mx-0 sm:px-0" />
    </form>
  );
}
