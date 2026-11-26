"use client";

import { ChevronDown, ExternalLink, RotateCcw, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { saveText } from "@/app/admin/(panel)/text/actions";
import { textPages, textSections, type TextPageKey, type TextSection } from "@/app/admin/(panel)/text/sections";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export type TextField = {
  key: string;
  /** The text in the dictionary file. */
  original: string;
  /** The saved edit, if any. */
  saved: string | null;
  /** The Indonesian it's translated from, shown under English and French fields. */
  indonesian: string | null;
};

const languages: { locale: Locale; name: string }[] = [
  { locale: "id", name: "Indonesia" },
  { locale: "en", name: "Inggris" },
  { locale: "fr", name: "Prancis" },
];

const whatsappMessage = "Pesan WhatsApp (otomatis terisi untuk pengunjung)";

// Plain names for the words used in the dictionary files.
const names: Record<string, string> = {
  title: "Judul",
  kicker: "Baris kecil di atas judul",
  lede: "Teks di bawah judul",
  intro: "Teks di bawah judul",
  body: "Teks",
  cta: "Tombol",
  button: "Tombol",
  link: "Teks link",
  after: "Teks setelah link",
  prompt: "Pertanyaan",
  detail: "Rincian",
  metaDescription: "Deskripsi di Google",
  photoAlt: "Deskripsi foto (dibacakan untuk pengunjung tunanetra)",
  message: whatsappMessage,
  chatMessage: whatsappMessage,
  planMessage: whatsappMessage,
  nav: "Menu",
  faq: "Pertanyaan",
  tiles: "Kotak",
  facts: "Fakta",
  steps: "Langkah",
  left: "Judul, bagian pertama",
  right: "Judul, bagian kedua (abu-abu)",
  sticker: "Baris kecil di atas judul",
  columns: "Judul kolom",
  seeTours: "Tombol: lihat tour",
  planOnWhatsapp: "Tombol: rencanakan lewat WhatsApp",
  accommodation: "Akomodasi",
  accommodationNote: "Catatan akomodasi",
  adults: "Dewasa",
  adventure: "Petualangan",
  airport: "Bandara",
  allTours: "Semua tour",
  anyDate: "Tanggal bebas",
  anyLength: "Semua durasi",
  anythingElse: "Ada pertanyaan lain",
  around: "Sekitar Jogja",
  askCustom: "Minta rute sendiri",
  back: "Tombol kembali",
  biggerVehicle: "Mobil lebih besar",
  biggerVehicleLink: "Link mobil lebih besar",
  cantFind: "Tidak ketemu",
  carNote: "Catatan mobil",
  cardTitle: "Judul kartu",
  change: "Tombol ubah",
  chat: "Tombol chat",
  choose: "Pilih",
  city: "Kota",
  clear: "Tombol hapus",
  clearRecent: "Hapus pencarian terakhir",
  close: "Tombol tutup",
  closeChange: "Tutup ubah pencarian",
  countAll: "Jumlah semua",
  countSome: "Jumlah sebagian",
  counts: "Jumlah",
  culture: "Budaya",
  date: "Tanggal",
  dateUnknown: "Tanggal belum pasti",
  description: "Deskripsi",
  destinations: "Tujuan",
  distance: "Jarak",
  done: "Tombol selesai",
  dropOff: "Titik antar",
  dropOffChoice: "Pilihan titik antar",
  dropOffDefault: "Titik antar biasa",
  dropOffs: "Tujuan akhir",
  duration: "Durasi",
  emptyBody: "Teks saat kosong",
  emptyTitle: "Judul saat kosong",
  estimateBody: "Teks perkiraan",
  estimateTitle: "Judul perkiraan",
  everything: "Semua",
  excludedAccommodation: "Tidak termasuk (dengan akomodasi)",
  excludedItems: "Yang tidak termasuk",
  excludedMultiDay: "Tidak termasuk (beberapa hari)",
  fewer: "Lebih sedikit",
  figure: "Angka",
  from: "Dari",
  fromPrice: "Harga mulai",
  fromPriceAccommodation: "Harga mulai (dengan akomodasi)",
  groups: "Kelompok",
  hour: "Jam",
  howLong: "Berapa lama",
  included: "Termasuk",
  includedAccommodation: "Termasuk (dengan akomodasi)",
  includedItems: "Yang termasuk",
  includedMultiDay: "Termasuk (beberapa hari)",
  infants: "Bayi",
  interests: "Minat",
  interestsLegend: "Judul pilihan minat",
  java: "Antarkota di Jawa",
  kids: "Anak",
  label: "Label",
  language: "Bahasa",
  lengths: "Durasi",
  lowestPrice: "Harga terendah",
  luggage: "Bagasi",
  luggageHint: "Keterangan bagasi",
  menu: "Menu",
  minute: "Menit",
  minuteHint: "Keterangan menit",
  more: "Lebih banyak",
  mostBooked: "Paling banyak dipesan",
  nature: "Alam",
  nextMonth: "Bulan berikutnya",
  nights: "Malam",
  noLuggage: "Tanpa bagasi",
  notIncluded: "Tidak termasuk",
  onGoogle: "Di Google",
  onRequest: "Tanpa harga (Hubungi kami)",
  orEmail: "Atau email",
  otherTours: "Tour lainnya",
  part: "Bagian paket",
  party: "Rombongan",
  passengers: "Penumpang",
  perCar: "Per mobil",
  pickTwo: "Pilih dua",
  pickup: "Jemput",
  pickupValue: "Isi jemput",
  placeGroups: "Kelompok tempat",
  placeholder: "Contoh teks di kolom isian",
  popularPrices: "Harga rute populer",
  popularTitle: "Judul rute populer",
  previousMonth: "Bulan sebelumnya",
  price: "Harga",
  priceAccommodation: "Harga dengan akomodasi",
  rating: "Rating",
  ratingCount: "Jumlah rating",
  readReviews: "Baca ulasan",
  recentTitle: "Judul pencarian terakhir",
  recommended: "Disarankan",
  request: "Tombol pesan",
  resultsTitle: "Judul hasil",
  samePlace: "Tempat sama",
  searchTour: "Cari tour",
  searchTransfer: "Cari antar jemput",
  seatClasses: "Kelompok kursi",
  seats: "Kursi",
  showAll: "Tampilkan semua",
  sight: "Wisata dan pulau",
  sortBy: "Urutkan",
  stars: "Bintang",
  stay: "Menginap",
  stayHints: "Keterangan pilihan menginap",
  stayLabel: "Label menginap",
  stayTitle: "Judul menginap",
  stays: "Pilihan menginap",
  sticky: "Label kecil di kartu rute",
  swap: "Tombol tukar",
  tabs: "Tab",
  teaser: "Baris di bawah nama paket",
  teaserAccommodation: "Baris di bawah nama paket (termasuk akomodasi)",
  temples: "Candi",
  time: "Jam",
  to: "Ke",
  tooBig: "Rombongan terlalu besar",
  total: "Total",
  tour: "Tour",
  tours: "Tour",
  transfer: "Antar jemput",
  transfers: "Antar jemput",
  translated: "Diterjemahkan",
  transport: "Transport saja",
  unknown: "Belum diketahui",
  vehicle: "Kendaraan",
  viewAll: "Lihat semua",
  viewAllPackages: "Lihat semua paket",
  visit: "Yang dikunjungi",
  wholePackage: "Seluruh paket",
  withLuggage: "Dengan bagasi",
  contact: "Kontak",
  "day-trip": "Perjalanan sehari",
  "multi-day": "Beberapa hari",
  five: "5 kursi",
  seven: "7 kursi",
  large: "Lebih dari 7 kursi",
  hint: "Keterangan",
  hours: "Jam",
  minutes: "Menit",
  hoursMinutes: "Jam dan menit",
  one: "Satu",
  other: "Lebih dari satu",
  shown: "Tampil",
};

function humanize(word: string) {
  const spaced = word.replace(/([A-Z])/g, " $1").replace(/-/g, " ").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function nameOf(word: string): string {
  if (names[word]) return names[word];
  if (/^message[A-Z]/.test(word)) {
    const rest = word.slice("message".length);
    return `Pesan WhatsApp: ${nameOf(rest.charAt(0).toLowerCase() + rest.slice(1)).toLowerCase()}`;
  }
  if (/Message$/.test(word)) return `${nameOf(word.slice(0, -"Message".length))}: pesan WhatsApp`;
  return humanize(word);
}

/** "plan.facts.0.label" → "Facts #1 · Label" (the section is already the card's title). */
export function fieldLabel(key: string) {
  const parts: string[] = [];
  for (const part of key.split(".").slice(1)) {
    if (/^\d+$/.test(part) && parts.length > 0) parts[parts.length - 1] += ` #${Number(part) + 1}`;
    else parts.push(nameOf(part));
  }
  return parts.join(" · ");
}

export type TextExamples = {
  /** A package's slug, for sections on a package page. */
  tour: string | null;
  /** A transfer search ("from=yia&to=jogja"), for sections on the transfer results. */
  route: string | null;
};

/** Where a section can be seen on the website, in the language being edited. */
function sectionHref(section: TextSection, locale: Locale, examples: TextExamples) {
  if (!section.path) return null;
  let path = section.path;
  if (path.includes("{tour}")) path = examples.tour ? path.replace("{tour}", examples.tour) : "/tours";
  if (path.includes("{route}")) path = examples.route ? path.replace("{route}", examples.route) : "/transfer";
  return `/${locale}${path === "/" ? "" : path}`;
}

export function TextEditor({ locale, fields, examples }: { locale: Locale; fields: TextField[]; examples: TextExamples }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveText.bind(null, locale));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.saved ?? field.original])),
  );
  const [page, setPage] = useState<TextPageKey>(textPages[0].key);
  const [query, setQuery] = useState("");
  // Sections start folded, so a tab is a short list of where text appears; tap one to edit its text.
  const [openSections, setOpenSections] = useState<ReadonlySet<string>>(() => new Set());
  const toggleSection = (key: string) =>
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const bySection = useMemo(
    () => new Map(textSections.map((section) => [section.key, fields.filter((field) => field.key.startsWith(`${section.key}.`))])),
    [fields],
  );
  const baseline = (field: TextField) => field.saved ?? field.original;
  const unsaved = fields.filter((field) => values[field.key] !== baseline(field));

  const search = query.trim().toLowerCase();
  const matches = (field: TextField) =>
    [values[field.key], field.original, field.indonesian ?? "", fieldLabel(field.key)].some((text) => text.toLowerCase().includes(search));
  const shown = textSections
    .filter((section) => (search ? true : section.page === page))
    .map((section) => ({ section, fields: (bySection.get(section.key) ?? []).filter((field) => !search || matches(field)) }))
    .filter((group) => group.fields.length > 0);

  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const discard = () => setValues(Object.fromEntries(fields.map((field) => [field.key, baseline(field)])));
  const errorList = Object.entries(errors).map(([name, message]) => ({ key: name.slice("text:".length), message }));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari kata di website"
            aria-label="Cari teks"
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-2 text-[13px]">
          <span className="text-muted-foreground">Bahasa:</span>
          <div className="inline-flex rounded-lg bg-muted p-1">
            {languages.map((language) => (
              <Link
                key={language.locale}
                href={language.locale === "id" ? "/admin/text" : `/admin/text?lang=${language.locale}`}
                className={cn(
                  "rounded-md px-3 py-2 font-medium text-muted-foreground md:py-1",
                  language.locale === locale && "bg-background text-foreground shadow",
                )}
              >
                {language.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p
        className={cn(
          "rounded-lg px-4 py-3 text-sm",
          locale === "id" ? "bg-muted text-muted-foreground" : "bg-amber-50 text-amber-900",
        )}
      >
        {locale === "id" ? (
          <>
            Pilih halaman, lalu ketuk bagian yang mau diubah, atau cari katanya di kotak pencarian. Tekan <strong>Lihat</strong> untuk
            membuka bagian itu di website. Setelah selesai, tekan <strong>Simpan</strong>; bahasa Inggris dan Prancis diterjemahkan
            otomatis. Kata di dalam kurung kurawal, seperti {"{price}"}, jangan diubah: website yang mengisinya.
          </>
        ) : (
          <>
            Anda sedang memperbaiki terjemahan bahasa {locale === "en" ? "Inggris" : "Prancis"}. Terjemahan ini dibuat otomatis
            dari bahasa Indonesia, jadi ubah hanya kalau salah. Perbaikan Anda tetap dipakai sampai teks Indonesianya berubah.
          </>
        )}
      </p>

      {search ? (
        <div className="flex items-center gap-2 text-sm">
          <span>
            Menampilkan teks berisi <strong>“{query.trim()}”</strong> di semua halaman.
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setQuery("")}>
            <X />
            Hapus pencarian
          </Button>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label="Bagian website"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {textPages.map((candidate) => (
            <button
              key={candidate.key}
              type="button"
              role="tab"
              aria-selected={candidate.key === page}
              onClick={() => setPage(candidate.key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:py-1.5",
                candidate.key === page ? "border-foreground bg-foreground text-background" : "hover:bg-accent",
              )}
            >
              {candidate.title}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">Tidak ada teks berisi “{query.trim()}”.</p>
      ) : (
        shown.map(({ section, fields: sectionFields }) => {
          const hasError = sectionFields.some((field) => errors[`text:${field.key}`]);
          // Searching shows the matching text straight away, and a section with a problem opens by itself.
          const open = Boolean(search) || hasError || openSections.has(section.key);
          const changed = sectionFields.filter((field) => field.saved !== null && field.saved !== field.original).length;
          const pending = sectionFields.filter((field) => values[field.key] !== baseline(field)).length;
          const bodyId = `section-${section.key}`;
          return (
            <section key={section.key} className="rounded-xl border">
              <div className="flex items-center gap-2 py-1 pr-2 pl-1 sm:pr-3">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={() => toggleSection(section.key)}
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-left hover:bg-accent/60"
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{section.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {section.where} · {sectionFields.length} teks
                      {changed > 0 ? ` · ${changed} sudah diubah` : ""}
                    </span>
                  </span>
                  {pending > 0 ? <span className="shrink-0 rounded bg-amber-100 px-1.5 text-[11px] text-amber-900">{pending} belum disimpan</span> : null}
                </button>
                <SectionLink href={sectionHref(section, locale, examples)} />
              </div>
              {open ? (
                <div id={bodyId} className="grid gap-5 border-t p-4">
                  {sectionFields.map((field) => (
                    <TextRow
                      key={field.key}
                      field={field}
                      value={values[field.key]}
                      unsaved={values[field.key] !== baseline(field)}
                      error={errors[`text:${field.key}`]}
                      onChange={(value) => setValue(field.key, value)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })
      )}

      {/* Only changed fields are sent, wherever they are in the tabs. */}
      {unsaved.map((field) => (
        <input key={field.key} type="hidden" name={`text:${field.key}`} value={values[field.key]} />
      ))}

      <div className="sticky -bottom-4 -mx-4 -mb-4 grid gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6">
        {errorList.length > 0 ? (
          <ul className="grid gap-0.5 text-xs text-destructive">
            {errorList.map((error) => (
              <li key={error.key}>
                <strong>{fieldLabel(error.key)}</strong>: {error.message}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto min-w-0 text-sm text-muted-foreground">
            {unsaved.length === 0 ? (
              "Belum ada perubahan"
            ) : (
              <>
                {unsaved.length} perubahan
                <span className="hidden sm:inline"> belum disimpan</span>
              </>
            )}
          </span>
          {unsaved.length > 0 ? (
            <Button type="button" variant="ghost" onClick={discard} disabled={pending}>
              Batalkan<span className="hidden sm:inline"> perubahan</span>
            </Button>
          ) : null}
          <Button type="submit" disabled={pending || unsaved.length === 0}>
            {pending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function SectionLink({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <Button asChild variant="outline" size="sm" className="shrink-0 max-md:h-10">
      <a href={href} target="_blank" rel="noreferrer">
        <ExternalLink />
        Lihat<span className="hidden sm:inline"> di website</span>
      </a>
    </Button>
  );
}

type TextRowProps = {
  field: TextField;
  value: string;
  unsaved: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function TextRow({ field, value, unsaved, error, onChange }: TextRowProps) {
  const id = `text-${field.key}`;

  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={id} className="text-[13px]">
          {fieldLabel(field.key)}
        </Label>
        {unsaved ? <span className="rounded bg-amber-100 px-1.5 text-[11px] text-amber-900">Belum disimpan</span> : null}
        {value !== field.original ? (
          <button
            type="button"
            onClick={() => onChange(field.original)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Kembalikan teks asli
          </button>
        ) : null}
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={Math.min(6, Math.max(1, Math.ceil(value.length / 110)))}
        aria-invalid={error ? true : undefined}
        className="min-h-9 resize-y"
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : field.indonesian ? (
        <p className="text-xs text-muted-foreground">Dari bahasa Indonesia: {field.indonesian}</p>
      ) : null}
    </div>
  );
}
