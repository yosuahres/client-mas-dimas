"use client";

import { saveHomePhotos } from "@/app/admin/(panel)/home-photos/actions";
import { FormSection, SaveBar } from "@/components/admin/form-fields";
import { PhotoField } from "@/components/admin/photo-field";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { HomePhotoSlot } from "@/lib/content/schema";

export type HomePhotoField = {
  slot: HomePhotoSlot;
  title: string;
  /** The uploaded photo's key, or null while the built-in one shows. */
  photo: string | null;
  preview: string | null;
  builtIn: string | null;
};

export function HomePhotosForm({ fields }: { fields: HomePhotoField[] }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveHomePhotos);
  const [hero, ...rest] = fields;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title={hero.title}>
        <PhotoField
          name={hero.slot}
          folder="home"
          defaultValue={hero.photo}
          defaultPreview={hero.preview}
          builtInPreview={hero.builtIn}
          error={errors[hero.slot]}
        />
      </FormSection>

      <FormSection title="Foto lainnya">
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((field) => (
            <div key={field.slot} className="grid content-start gap-2">
              <h3 className="text-[13px] font-medium">{field.title}</h3>
              <PhotoField
                name={field.slot}
                folder="home"
                defaultValue={field.photo}
                defaultPreview={field.preview}
                builtInPreview={field.builtIn}
                error={errors[field.slot]}
              />
            </div>
          ))}
        </div>
      </FormSection>

      <SaveBar pending={pending} />
    </form>
  );
}
