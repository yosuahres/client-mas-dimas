import type { Dictionary } from "@/i18n/dictionaries/en";

// The tabs of the Website text page: one per part of the site, in the order a visitor meets them.
export const textPages = [
  { key: "home", title: "Beranda" },
  { key: "tours", title: "Paket tour" },
  { key: "transfers", title: "Bandara & antar jemput" },
  { key: "info", title: "Halaman info" },
  { key: "every", title: "Semua halaman" },
  { key: "google", title: "Google" },
] as const;

export type TextPageKey = (typeof textPages)[number]["key"];

/**
 * path: where the section can be seen on the website, after /<language>. "{tour}" is a package's page and "{route}" a
 * transfer search, filled in by the editor. None: not on a page (Google's search result).
 */
export type TextSection = { key: keyof Dictionary; path?: string; page: TextPageKey; title: string };

// Friendly names for the top-level parts of the dictionaries.
export const textSections: TextSection[] = [
  { key: "hero", path: "/", page: "home", title: "Foto besar di atas" },
  { key: "search", path: "/", page: "home", title: "Kotak pencarian" },
  { key: "guides", path: "/", page: "home", title: "Sopir" },
  { key: "firstStep", path: "/", page: "home", title: "Empat kotak foto" },
  { key: "transfersFeature", path: "/", page: "home", title: "Jemput bandara" },
  { key: "custom", path: "/", page: "home", title: "Baris “Mau ke tempat lain?”" },
  { key: "reviews", path: "/", page: "home", title: "Judul ulasan" },
  { key: "toursPage", path: "/tours", page: "tours", title: "Judul halaman Tour" },
  { key: "catalog", path: "/tours", page: "tours", title: "Filter dan urutan" },
  { key: "tourRow", path: "/tours", page: "tours", title: "Kartu paket" },
  { key: "tourPage", path: "/tours/{tour}", page: "tours", title: "Halaman paket" },
  { key: "bookingCard", path: "/tours/{tour}", page: "tours", title: "Kotak pemesanan" },
  { key: "transferPage", path: "/transfer?{route}", page: "transfers", title: "Halaman antar jemput" },
  { key: "transfer", path: "/transfer?{route}", page: "transfers", title: "Kelompok tempat dan waktu" },
  { key: "gallery", path: "/gallery", page: "info", title: "Halaman Galeri" },
  { key: "articles", path: "/articles", page: "info", title: "Halaman Artikel" },
  { key: "booking", path: "/how-to-book", page: "info", title: "Halaman Cara memesan" },
  { key: "faq", path: "/faq", page: "info", title: "Halaman Pertanyaan" },
  { key: "header", path: "/", page: "every", title: "Menu atas" },
  { key: "pickers", path: "/", page: "every", title: "Pilihan tanggal, jam, dan penumpang" },
  { key: "footer", path: "/", page: "every", title: "Footer" },
  { key: "notFound", path: "/halaman-yang-tidak-ada", page: "every", title: "Halaman link rusak" },
  { key: "meta", page: "google", title: "Hasil pencarian Google" },
];
