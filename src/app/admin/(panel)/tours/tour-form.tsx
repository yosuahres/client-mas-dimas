"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";

import { saveTour } from "@/app/admin/(panel)/tours/actions";
import { autoTranslatedPlaceholder, Field, FormSection, LocaleTabs, SaveBar, SwitchField, TextAreaField, TextField } from "@/components/admin/form-fields";
import { PhotoField } from "@/components/admin/photo-field";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { TourRecord } from "@/lib/content/schema";
import { tourInterests, tourLengths } from "@/lib/content/schema";

const lengthLabels = { "day-trip": "Day trip", "multi-day": "Multi-day" } as const;
const interestLabels = { temples: "Temples", culture: "Heritage and culture", nature: "Nature and volcanoes", adventure: "Adventure" } as const;

type TourFormProps = {
  tour: TourRecord | null;
  photoPreview: string | null;
};

export function TourForm({ tour, photoPreview }: TourFormProps) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveTour.bind(null, tour?.slug ?? null));
  const [onRequest, setOnRequest] = useState(tour ? tour.priceFromIdr === null : false);

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Package" description="How the package is listed and filtered on the Tours page.">
        <div className="grid gap-4 sm:grid-cols-[6rem_1fr]">
          <TextField name="code" label="Letter" defaultValue={tour?.code} errors={errors} hint="e.g. A" maxLength={4} />
          <TextField
            name="slug"
            label="Short name for the web address"
            defaultValue={tour?.slug}
            errors={errors}
            hint={`jogja-transport.com/en/tours/${tour?.slug ?? "borobudur-sunrise"}. Changing it breaks old links.`}
          />
        </div>

        <Field label="Length" error={errors.length}>
          <div className="flex flex-wrap gap-2">
            {tourLengths.map((length) => (
              <label key={length} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-accent">
                <input type="radio" name="length" value={length} defaultChecked={(tour?.length ?? "day-trip") === length} className="accent-black" />
                {lengthLabels[length]}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Interests" hint="Used by the filters on the Tours page and the four tiles on the home page." error={errors.interests}>
          <div className="flex flex-wrap gap-2">
            {tourInterests.map((interest) => (
              <label key={interest} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-accent">
                <input type="checkbox" name="interests[]" value={interest} defaultChecked={tour?.interests.includes(interest)} className="accent-black" />
                {interestLabels[interest]}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="priceFromIdr"
            label="Price from (Rp, per vehicle)"
            inputMode="numeric"
            placeholder="550000"
            defaultValue={tour?.priceFromIdr ?? ""}
            disabled={onRequest}
            errors={errors}
            hint="The cheapest car, with driver, fuel and parking."
          />
          <SwitchField
            name="onRequest"
            label="Price on request"
            hint='Shows "On request" instead of a price.'
            defaultChecked={onRequest}
            onCheckedChange={setOnRequest}
          />
        </div>

        <SwitchField
          name="published"
          label="Show on the website"
          hint="Turn off to keep a draft or hide a package for a while."
          defaultChecked={tour?.published ?? true}
        />
      </FormSection>

      <FormSection title="Photo" description="The big photo at the top of the package page and on its card.">
        <PhotoField name="photo" defaultValue={tour?.photo ?? null} defaultPreview={photoPreview} error={errors.photo} />
        <details className="rounded-lg border px-3 py-2 text-sm" open={Boolean(tour?.photoCredit)}>
          <summary className="text-[13px] font-medium">Photo credit</summary>
          <p className="mt-1 text-xs text-muted-foreground">
            Only for photos you didn&apos;t take, e.g. from Wikimedia Commons. Leave the author empty for your own photos.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TextField name="credit.author" label="Author" defaultValue={tour?.photoCredit?.author} errors={errors} />
            <TextField name="credit.license" label="Licence" placeholder="CC BY-SA 4.0" defaultValue={tour?.photoCredit?.license} errors={errors} />
            <TextField name="credit.subject" label="What it shows" placeholder="Borobudur" defaultValue={tour?.photoCredit?.subject} errors={errors} />
            <TextField name="credit.source" label="Link to the original" type="url" defaultValue={tour?.photoCredit?.source} errors={errors} />
          </div>
        </details>
      </FormSection>

      <FormSection title="Text" description="What guests read, in each language.">
        <LocaleTabs errors={errors} prefixes={["text"]}>
          {(locale) => {
            const text = tour?.text[locale];
            const prefix = `text.${locale}`;
            return (
              <div className="grid gap-4">
                <TextField name={`${prefix}.name`} label="Name" defaultValue={text?.name} errors={errors} placeholder={locale === "id" ? "" : autoTranslatedPlaceholder} />
                <TextAreaField
                  name={`${prefix}.summary`}
                  label="Summary"
                  rows={3}
                  defaultValue={text?.summary}
                  errors={errors}
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextField
                  name={`${prefix}.duration`}
                  label="Duration"
                  defaultValue={text?.duration}
                  errors={errors}
                  hint='e.g. "Day trip, there and back" or "2 days, 1 night"'
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextAreaField
                  name={`${prefix}.destinations`}
                  label="Where you go"
                  rows={4}
                  defaultValue={text?.destinations.join("\n")}
                  errors={errors}
                  hint="One stop per line, in order."
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextField
                  name={`${prefix}.photoAlt`}
                  label="Photo description"
                  defaultValue={text?.photoAlt}
                  errors={errors}
                  hint="Describes the photo for blind visitors and Google."
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
              </div>
            );
          }}
        </LocaleTabs>
      </FormSection>

      <SaveBar pending={pending} label={tour ? "Save changes" : "Create package"}>
        {tour ? (
          <Button asChild variant="ghost">
            <a href={`/en/tours/${tour.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink />
              View on website
            </a>
          </Button>
        ) : null}
      </SaveBar>
    </form>
  );
}
