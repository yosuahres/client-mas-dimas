"use client";

import { saveHomePhotos } from "@/app/admin/(panel)/home-photos/actions";
import { FormSection, SaveBar } from "@/components/admin/form-fields";
import { PhotoField } from "@/components/admin/photo-field";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { HomePhotoSlot } from "@/lib/content/schema";

export type HomePhotoField = {
  slot: HomePhotoSlot;
  title: string;
  description?: string;
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
      <FormSection title={hero.title} description={hero.description}>
        <PhotoField
          name={hero.slot}
          folder="home"
          defaultValue={hero.photo}
          defaultPreview={hero.preview}
          builtInPreview={hero.builtIn}
          error={errors[hero.slot]}
        />
      </FormSection>

      <FormSection title="Other photos" description="The four tiles and the drivers section further down the home page.">
        <div className="grid gap-6 sm:grid-cols-2">
          {rest.map((field) => (
            <div key={field.slot} className="grid content-start gap-2">
              <h3 className="text-[13px] font-medium">{field.title}</h3>
              {field.description ? <p className="text-xs text-muted-foreground">{field.description}</p> : null}
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
