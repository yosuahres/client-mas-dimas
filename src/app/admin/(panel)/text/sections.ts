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

export type TextSection = { key: keyof Dictionary; page: TextPageKey; title: string; where: string };

// Friendly names for the top-level parts of the dictionaries.
export const textSections: TextSection[] = [
  { key: "hero", page: "home", title: "Foto besar di atas", where: "Yang pertama dilihat pengunjung" },
  { key: "search", page: "home", title: "Kotak pencarian", where: "Cari tour atau antar jemput" },
  { key: "toursSection", page: "home", title: "Deretan paket", where: "Baris paket yang bisa digeser" },
  { key: "guides", page: "home", title: "Sopir", where: "Bagian tentang sopir yang hafal jalan" },
  { key: "firstStep", page: "home", title: "Empat kotak foto", where: "Candi, budaya, alam, petualangan" },
  { key: "transfersFeature", page: "home", title: "Jemput bandara", where: "Bagian jemput bandara" },
  { key: "custom", page: "home", title: "Baris “Mau ke tempat lain?”", where: "Di bawah paket" },
  { key: "reviews", page: "home", title: "Judul ulasan", where: "Di atas ulasan tamu" },
  { key: "toursPage", page: "tours", title: "Judul halaman Tour", where: "Bagian atas halaman Tour" },
  { key: "catalog", page: "tours", title: "Filter dan urutan", where: "Filter di halaman Tour" },
  { key: "tourRow", page: "tours", title: "Kartu paket", where: "Setiap paket di daftar" },
  { key: "tourPage", page: "tours", title: "Halaman paket", where: "Termasuk, tidak termasuk, titik antar" },
  { key: "bookingCard", page: "tours", title: "Kotak pemesanan", where: "Formulir pesan di halaman paket, dan pesan WhatsApp-nya" },
  { key: "transferPage", page: "transfers", title: "Halaman antar jemput", where: "Hasil, catatan, dan pesan WhatsApp" },
  { key: "transfer", page: "transfers", title: "Kelompok tempat dan waktu", where: "Nama kelompok tempat, kursi, lama perjalanan" },
  { key: "plan", page: "info", title: "Halaman Rencanakan kunjungan", where: "Fakta dan berapa lama tinggal" },
  { key: "booking", page: "info", title: "Halaman Cara memesan", where: "Tiga langkahnya" },
  { key: "faq", page: "info", title: "Halaman Pertanyaan", where: "Judul dan baris WhatsApp" },
  { key: "header", page: "every", title: "Menu atas", where: "Menu di atas setiap halaman" },
  { key: "pickers", page: "every", title: "Pilihan tanggal, jam, dan penumpang", where: "Kalender, jam, dan jumlah penumpang di formulir pencarian dan pemesanan" },
  { key: "pageCta", page: "every", title: "Pita “Siap memilih perjalanan?”", where: "Dekat bagian bawah sebagian besar halaman" },
  { key: "footer", page: "every", title: "Footer", where: "Bagian bawah setiap halaman" },
  { key: "notFound", page: "every", title: "Halaman link rusak", where: "Muncul kalau link salah" },
  { key: "meta", page: "google", title: "Hasil pencarian Google", where: "Judul dan deskripsi yang tampil di Google" },
];
