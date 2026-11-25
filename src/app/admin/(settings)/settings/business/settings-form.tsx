"use client";

import { saveSettings } from "@/app/admin/(settings)/settings/business/actions";
import { FormSection, SaveBar, TextAreaField, TextField } from "@/components/admin/form-fields";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { SiteSettings } from "@/lib/content/schema";

export function SettingsForm({ settings }: { settings: SiteSettings | null }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveSettings);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Kontak" description="Tampil di footer, dan dipakai untuk setiap tombol WhatsApp di website.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="businessName" label="Nama usaha" defaultValue={settings?.businessName} errors={errors} />
          <TextField
            name="whatsappNumber"
            label="Nomor WhatsApp"
            inputMode="tel"
            defaultValue={settings?.whatsappNumber}
            errors={errors}
            hint="Format internasional tanpa +, misalnya 628112653767."
          />
          <TextField name="phoneDisplay" label="Nomor telepon yang ditampilkan" defaultValue={settings?.phoneDisplay} errors={errors} hint="Misalnya +62 811 2653 767" />
          <TextField name="email" label="Email" type="email" defaultValue={settings?.email} errors={errors} />
        </div>
        <TextAreaField name="address" label="Alamat" rows={2} defaultValue={settings?.address} errors={errors} />
      </FormSection>

      <FormSection title="Link dan rating">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="googleRating" label="Rating Google" inputMode="decimal" defaultValue={settings?.googleRating} errors={errors} hint="Salin dari Google Business Profile Anda, misalnya 4.9." />
          <TextField name="googleReviewsUrl" label="Link ulasan Google" type="url" defaultValue={settings?.googleReviewsUrl} errors={errors} />
          <TextField name="instagramUrl" label="Link Instagram" type="url" defaultValue={settings?.instagramUrl} errors={errors} />
          <TextField name="siteUrl" label="Alamat website" type="url" defaultValue={settings?.siteUrl} errors={errors} hint="Dipakai di link yang dibagikan di media sosial." />
        </div>
      </FormSection>

      <FormSection title="Harga" description="Tamu asing melihat perkiraan harga dalam dolar AS di samping harga rupiah.">
        <TextField
          name="idrPerUsd"
          label="Rupiah per dolar AS"
          inputMode="numeric"
          defaultValue={settings?.idrPerUsd}
          errors={errors}
          hint="Perbarui sesekali, misalnya 16500."
          className="max-w-xs"
        />
      </FormSection>

      {/* Kept to the settings column instead of running to the panel's edges. */}
      <SaveBar pending={pending} className="mx-0 px-0 sm:mx-0 sm:px-0" />
    </form>
  );
}
