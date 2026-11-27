"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { Fragment, useState } from "react";

import { saveTour } from "@/app/admin/(panel)/tours/actions";
import { CarPricesField, type PriceCar } from "@/app/admin/(panel)/tours/car-prices-field";
import { PartsEditor } from "@/app/admin/(panel)/tours/parts-editor";
import { autoTranslatedPlaceholder, Field, FormSection, GuestExample, LocaleTabs, SaveBar, SwitchField, TextAreaField, TextField } from "@/components/admin/form-fields";
import { PhotoField } from "@/components/admin/photo-field";
import { seatClassLabels } from "@/components/admin/seat-class-labels";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { TourRecord } from "@/lib/content/schema";
import { seatClasses, tourInterests, tourLengths } from "@/lib/content/schema";
import { formatIdr } from "@/lib/money";
import { cheapestCarPrice } from "@/lib/pricing";

const lengthLabels = { "day-trip": "Perjalanan sehari", "multi-day": "Beberapa hari" } as const;
const interestLabels = { temples: "Candi", culture: "Sejarah dan budaya", nature: "Alam dan gunung api", adventure: "Petualangan" } as const;

/** "550.000" → 550000; empty, or no digits → null (on request). */
function typedPrice(typed: string) {
  const digits = typed.replace(/\D/g, "");
  return digits && Number(digits) > 0 ? Number(digits) : null;
}

/** 550000 → "Mulai Rp 550.000"; null → "Hubungi kami", as on the website. */
function priceLabel(price: number | null) {
  return price === null ? "Hubungi kami" : `Mulai ${formatIdr(price, "id")}`;
}

type TourFormProps = {
  tour: TourRecord | null;
  photoPreview: string | null;
  /** Every car, for the package's own price in each. */
  cars: PriceCar[];
};

export function TourForm({ tour, photoPreview, cars }: TourFormProps) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveTour.bind(null, tour?.slug ?? null));
  // Typed prices, read live for the "what guests see" box.
  const [carPrices, setCarPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(tour?.carPrices ?? {}).map(([car, value]) => [car, String(value)])),
  );
  const typedCarPrices = Object.fromEntries(
    Object.entries(carPrices).flatMap(([car, typed]) => {
      const value = typedPrice(typed);
      return value === null ? [] : [[car, value]];
    }),
  );
  // Guests see the lowest price across the cars on the website.
  const shownCars = cars.filter((car) => car.published);
  const transportFrom = cheapestCarPrice(typedCarPrices, shownCars);
  const [accommodationOffered, setAccommodationOffered] = useState(tour?.accommodationOffered ?? true);
  const [accommodationPrice, setAccommodationPrice] = useState(String(tour?.accommodationPriceFromIdr ?? ""));
  const creditHasError = Object.keys(errors).some((key) => key.startsWith("credit."));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Paket">
        <TextField
          name="code"
          label="Huruf paket"
          placeholder="A"
          defaultValue={tour?.code}
          errors={errors}
          maxLength={4}
          className="max-w-md"
        />

        <Field label="Lama perjalanan" error={errors.length}>
          <div className="flex flex-wrap gap-2">
            {tourLengths.map((length) => (
              <label key={length} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-accent">
                <input type="radio" name="length" value={length} defaultChecked={(tour?.length ?? "day-trip") === length} className="accent-black" />
                {lengthLabels[length]}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Minat" error={errors.interests}>
          <div className="flex flex-wrap gap-2">
            {tourInterests.map((interest) => (
              <label key={interest} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm has-checked:border-primary has-checked:bg-accent">
                <input type="checkbox" name="interests[]" value={interest} defaultChecked={tour?.interests.includes(interest)} className="accent-black" />
                {interestLabels[interest]}
              </label>
            ))}
          </div>
        </Field>

        <SwitchField
          name="published"
          label="Tampilkan di website"
          defaultChecked={tour?.published ?? true}
        />
      </FormSection>

      <FormSection title="Harga">
        <div className="grid gap-2">
          <div>
            <p className="text-[13px] font-medium">Transport saja: harga paket per mobil (Rp)</p>
            <p className="text-xs text-muted-foreground">Kosong: tamu melihat Hubungi kami untuk mobil itu.</p>
          </div>
          <CarPricesField
            cars={cars}
            name="carPrices"
            defaultValues={tour?.carPrices ?? {}}
            onPriceChange={(car, typed) => setCarPrices((current) => ({ ...current, [car]: typed }))}
            errors={errors}
          />
        </div>

        <PartsEditor names={tour?.text.id?.parts ?? []} prices={tour?.partPrices ?? []} cars={cars} errors={errors} />

        <SwitchField
          name="accommodationOffered"
          label="Juga dijual termasuk akomodasi"
          defaultChecked={accommodationOffered}
          onCheckedChange={setAccommodationOffered}
        />
        {accommodationOffered ? (
          <TextField
            name="accommodationPriceFromIdr"
            label="Termasuk akomodasi: harga mulai (Rp)"
            inputMode="numeric"
            placeholder="Kosong: Hubungi kami"
            value={accommodationPrice}
            onChange={(event) => setAccommodationPrice(event.target.value)}
            errors={errors}
          />
        ) : null}
        <GuestExample title="Yang dilihat tamu">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            <dt className="text-muted-foreground">Transport saja</dt>
            <dd className="font-medium">{priceLabel(transportFrom)}</dd>
            {/* A seat group costs its cheapest car, as in the website's car picker. */}
            {seatClasses.map((seatClass) => {
              const group = shownCars.filter((car) => car.seatClass === seatClass);
              if (group.length === 0) return null;
              const price = cheapestCarPrice(typedCarPrices, group);
              return (
                <Fragment key={seatClass}>
                  <dt className="pl-3 text-muted-foreground">{seatClassLabels[seatClass]}</dt>
                  <dd>{price === null ? "Hubungi kami" : formatIdr(price, "id")}</dd>
                </Fragment>
              );
            })}
            <dt className="text-muted-foreground">Termasuk akomodasi</dt>
            <dd className="font-medium">{accommodationOffered ? priceLabel(typedPrice(accommodationPrice)) : "Tidak dijual"}</dd>
          </dl>
        </GuestExample>
      </FormSection>

      <FormSection title="Foto">
        <PhotoField name="photo" defaultValue={tour?.photo ?? null} defaultPreview={photoPreview} error={errors.photo} />
        {/* Rarely needed, so folded; the summary says what's there. Opens by itself when a field in it has an error. */}
        <details className="group rounded-lg border px-3 text-sm" open={creditHasError}>
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[13px] [&::-webkit-details-marker]:hidden">
            <span className="font-medium">Kredit foto</span>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {tour?.photoCredit ? `${tour.photoCredit.author}${tour.photoCredit.license ? `, ${tour.photoCredit.license}` : ""}` : "Tidak ada (foto sendiri)"}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 mb-3 grid gap-3 sm:grid-cols-2">
            <TextField name="credit.author" label="Pembuat" defaultValue={tour?.photoCredit?.author} errors={errors} />
            <TextField name="credit.license" label="Lisensi" placeholder="CC BY-SA 4.0" defaultValue={tour?.photoCredit?.license} errors={errors} />
            <TextField name="credit.subject" label="Isi foto" placeholder="Borobudur" defaultValue={tour?.photoCredit?.subject} errors={errors} />
            <TextField name="credit.source" label="Link ke foto asli" type="url" defaultValue={tour?.photoCredit?.source} errors={errors} />
          </div>
        </details>
      </FormSection>

      <FormSection title="Teks">
        <LocaleTabs errors={errors} prefixes={["text"]}>
          {(locale) => {
            const text = tour?.text[locale];
            const prefix = `text.${locale}`;
            return (
              <div className="grid gap-4">
                <TextField name={`${prefix}.name`} label="Nama" defaultValue={text?.name} errors={errors} placeholder={locale === "id" ? "" : autoTranslatedPlaceholder} />
                <TextAreaField
                  name={`${prefix}.summary`}
                  label="Ringkasan"
                  rows={3}
                  defaultValue={text?.summary}
                  errors={errors}
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextField
                  name={`${prefix}.duration`}
                  label="Durasi"
                  defaultValue={text?.duration}
                  errors={errors}
                  placeholder={locale === "id" ? "2 hari 1 malam" : autoTranslatedPlaceholder}
                />
                <TextAreaField
                  name={`${prefix}.destinations`}
                  label="Tujuan"
                  rows={4}
                  defaultValue={text?.destinations.join("\n")}
                  errors={errors}
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextAreaField
                  name={`${prefix}.dropOffs`}
                  label="Titik antar"
                  rows={3}
                  defaultValue={text?.dropOffs.join("\n")}
                  errors={errors}
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                {locale === "id" ? null : (
                  <TextAreaField
                    name={`${prefix}.parts`}
                    label="Pilihan sebagian paket"
                    rows={2}
                    defaultValue={text?.parts.join("\n")}
                    errors={errors}
                    placeholder={autoTranslatedPlaceholder}
                  />
                )}
                <TextField
                  name={`${prefix}.photoAlt`}
                  label="Deskripsi foto"
                  defaultValue={text?.photoAlt}
                  errors={errors}
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
              </div>
            );
          }}
        </LocaleTabs>
      </FormSection>

      <SaveBar pending={pending} label={tour ? "Simpan perubahan" : "Buat paket"}>
        {tour ? (
          <Button asChild variant="ghost">
            <a href={`/en/tours/${tour.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink />
              Lihat di website
            </a>
          </Button>
        ) : null}
      </SaveBar>
    </form>
  );
}
