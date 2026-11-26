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
export type TextSection = { key: keyof Dictionary; path?: string; page: TextPageKey; title: string; where: string };

// Friendly names for the top-level parts of the dictionaries.
export const textSections: TextSection[] = [
  { key: "hero", path: "/", page: "home", title: "Foto besar di atas", where: "Yang pertama dilihat pengunjung" },
  { key: "search", path: "/", page: "home", title: "Kotak pencarian", where: "Cari tour atau antar jemput" },
  { key: "toursSection", path: "/", page: "home", title: "Deretan paket", where: "Baris paket yang bisa digeser" },
  { key: "guides", path: "/", page: "home", title: "Sopir", where: "Bagian tentang sopir yang hafal jalan" },
  { key: "firstStep", path: "/", page: "home", title: "Empat kotak foto", where: "Candi, budaya, alam, petualangan" },
  { key: "transfersFeature", path: "/", page: "home", title: "Jemput bandara", where: "Bagian jemput bandara" },
  { key: "custom", path: "/", page: "home", title: "Baris “Mau ke tempat lain?”", where: "Di bawah paket" },
  { key: "reviews", path: "/", page: "home", title: "Judul ulasan", where: "Di atas ulasan tamu" },
  { key: "toursPage", path: "/tours", page: "tours", title: "Judul halaman Tour", where: "Bagian atas halaman Tour" },
  { key: "catalog", path: "/tours", page: "tours", title: "Filter dan urutan", where: "Filter di halaman Tour" },
  { key: "tourRow", path: "/tours", page: "tours", title: "Kartu paket", where: "Setiap paket di daftar" },
  { key: "tourPage", path: "/tours/{tour}", page: "tours", title: "Halaman paket", where: "Termasuk, tidak termasuk, titik antar" },
  { key: "bookingCard", path: "/tours/{tour}", page: "tours", title: "Kotak pemesanan", where: "Formulir pesan di halaman paket, dan pesan WhatsApp-nya" },
  { key: "transferPage", path: "/transfer?{route}", page: "transfers", title: "Halaman antar jemput", where: "Hasil, catatan, dan pesan WhatsApp" },
  { key: "transfer", path: "/transfer?{route}", page: "transfers", title: "Kelompok tempat dan waktu", where: "Nama kelompok tempat, kursi, lama perjalanan" },
  { key: "plan", path: "/plan-your-visit", page: "info", title: "Halaman Rencanakan kunjungan", where: "Fakta dan berapa lama tinggal" },
  { key: "booking", path: "/how-to-book", page: "info", title: "Halaman Cara memesan", where: "Tiga langkahnya" },
  { key: "faq", path: "/faq", page: "info", title: "Halaman Pertanyaan", where: "Judul dan baris WhatsApp" },
  { key: "header", path: "/", page: "every", title: "Menu atas", where: "Menu di atas setiap halaman" },
  { key: "pickers", path: "/", page: "every", title: "Pilihan tanggal, jam, dan penumpang", where: "Kalender, jam, dan jumlah penumpang di formulir pencarian dan pemesanan" },
  { key: "pageCta", path: "/tours", page: "every", title: "Pita “Siap memilih perjalanan?”", where: "Dekat bagian bawah sebagian besar halaman" },
  { key: "footer", path: "/", page: "every", title: "Footer", where: "Bagian bawah setiap halaman" },
  { key: "notFound", path: "/halaman-yang-tidak-ada", page: "every", title: "Halaman link rusak", where: "Muncul kalau link salah" },
  { key: "meta", page: "google", title: "Hasil pencarian Google", where: "Judul dan deskripsi yang tampil di Google" },
];
