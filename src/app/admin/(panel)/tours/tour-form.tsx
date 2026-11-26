"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";

import { saveTour } from "@/app/admin/(panel)/tours/actions";
import { PartsEditor } from "@/app/admin/(panel)/tours/parts-editor";
import { autoTranslatedPlaceholder, Field, FormSection, LocaleTabs, SaveBar, SwitchField, TextAreaField, TextField } from "@/components/admin/form-fields";
import { PhotoField } from "@/components/admin/photo-field";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import type { TourRecord } from "@/lib/content/schema";
import { tourInterests, tourLengths } from "@/lib/content/schema";

const lengthLabels = { "day-trip": "Perjalanan sehari", "multi-day": "Beberapa hari" } as const;
const interestLabels = { temples: "Candi", culture: "Sejarah dan budaya", nature: "Alam dan gunung api", adventure: "Petualangan" } as const;

type TourFormProps = {
  tour: TourRecord | null;
  photoPreview: string | null;
};

export function TourForm({ tour, photoPreview }: TourFormProps) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveTour.bind(null, tour?.slug ?? null));
  const [onRequest, setOnRequest] = useState(tour ? tour.priceFromIdr === null : false);
  const [accommodationOffered, setAccommodationOffered] = useState(tour?.accommodationOffered ?? true);
  const [accommodationOnRequest, setAccommodationOnRequest] = useState(tour ? tour.accommodationPriceFromIdr === null : true);
  const creditHasError = Object.keys(errors).some((key) => key.startsWith("credit."));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormSection title="Paket" description="Cara paket ditampilkan dan difilter di halaman Tour.">
        <div className="max-w-40">
          <TextField name="code" label="Huruf paket" defaultValue={tour?.code} errors={errors} hint="Misalnya A atau P2" maxLength={4} />
        </div>

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

        <Field label="Minat" hint="Dipakai filter di halaman Tour dan empat kotak foto di beranda." error={errors.interests}>
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
            label="Transport saja: harga mulai (Rp, per kendaraan)"
            inputMode="numeric"
            placeholder="550000"
            defaultValue={tour?.priceFromIdr ?? ""}
            disabled={onRequest}
            errors={errors}
            hint="Mobil termurah, termasuk sopir, BBM, dan parkir."
          />
          <SwitchField
            name="onRequest"
            label="Tanpa harga (Hubungi kami)"
            hint='Menampilkan "Hubungi kami" sebagai ganti harga.'
            defaultChecked={onRequest}
            onCheckedChange={setOnRequest}
          />
        </div>

        <div className="grid gap-3">
          <SwitchField
            name="accommodationOffered"
            label="Juga dijual termasuk akomodasi"
            hint='Paket tampil di bagian "Termasuk akomodasi" di halaman Tour, dan tamu bisa memilihnya saat memesan.'
            defaultChecked={accommodationOffered}
            onCheckedChange={setAccommodationOffered}
          />
          {accommodationOffered ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                name="accommodationPriceFromIdr"
                label="Termasuk akomodasi: harga mulai (Rp)"
                inputMode="numeric"
                placeholder="3500000"
                defaultValue={tour?.accommodationPriceFromIdr ?? ""}
                disabled={accommodationOnRequest}
                errors={errors}
                hint="Mobil dan hotel termurah, dijumlahkan."
              />
              <SwitchField
                name="accommodationOnRequest"
                label="Harga akomodasi: Hubungi kami"
                hint='Menampilkan "Hubungi kami"; Anda kirim pilihan hotel lewat WhatsApp.'
                defaultChecked={accommodationOnRequest}
                onCheckedChange={setAccommodationOnRequest}
              />
            </div>
          ) : null}
        </div>

        <PartsEditor names={tour?.text.id?.parts ?? []} prices={tour?.partPrices ?? []} errors={errors} />

        <SwitchField
          name="published"
          label="Tampilkan di website"
          hint="Matikan untuk menyimpan sebagai draf atau menyembunyikan paket sementara."
          defaultChecked={tour?.published ?? true}
        />
      </FormSection>

      <FormSection title="Foto" description="Foto besar di atas halaman paket dan di kartunya.">
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
          <p className="mt-1 text-xs text-muted-foreground">
            Hanya untuk foto yang bukan milik Anda, misalnya dari Wikimedia Commons. Kosongkan nama pembuat untuk foto sendiri.
          </p>
          <div className="mt-3 mb-3 grid gap-3 sm:grid-cols-2">
            <TextField name="credit.author" label="Pembuat" defaultValue={tour?.photoCredit?.author} errors={errors} />
            <TextField name="credit.license" label="Lisensi" placeholder="CC BY-SA 4.0" defaultValue={tour?.photoCredit?.license} errors={errors} />
            <TextField name="credit.subject" label="Isi foto" placeholder="Borobudur" defaultValue={tour?.photoCredit?.subject} errors={errors} />
            <TextField name="credit.source" label="Link ke foto asli" type="url" defaultValue={tour?.photoCredit?.source} errors={errors} />
          </div>
        </details>
      </FormSection>

      <FormSection title="Teks" description="Yang dibaca tamu, dalam setiap bahasa.">
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
                  hint='Misalnya "Perjalanan sehari, pulang pergi" atau "2 hari 1 malam"'
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextAreaField
                  name={`${prefix}.destinations`}
                  label="Tujuan"
                  rows={4}
                  defaultValue={text?.destinations.join("\n")}
                  errors={errors}
                  hint="Satu tujuan per baris, sesuai urutan."
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                <TextAreaField
                  name={`${prefix}.dropOffs`}
                  label="Titik antar"
                  rows={3}
                  defaultValue={text?.dropOffs.join("\n")}
                  errors={errors}
                  hint='Tempat tamu bisa diantar di akhir perjalanan, satu per baris, misalnya "Bandara Juanda, Surabaya". Yang pertama adalah yang biasa. Kosongkan untuk "kembali ke hotel di Jogja".'
                  placeholder={locale === "id" ? "" : autoTranslatedPlaceholder}
                />
                {locale === "id" ? null : (
                  <TextAreaField
                    name={`${prefix}.parts`}
                    label="Pilihan sebagian paket"
                    rows={2}
                    defaultValue={text?.parts.join("\n")}
                    errors={errors}
                    hint="Diterjemahkan dari pilihan sebagian paket di bagian Paket. Satu per baris, urutannya sama."
                    placeholder={autoTranslatedPlaceholder}
                  />
                )}
                <TextField
                  name={`${prefix}.photoAlt`}
                  label="Deskripsi foto"
                  defaultValue={text?.photoAlt}
                  errors={errors}
                  hint="Menjelaskan isi foto untuk pengunjung tunanetra dan Google."
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
