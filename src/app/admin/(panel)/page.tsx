import { Bus, CircleCheck, CircleHelp, CircleAlert, Map as MapIcon, MapPinned, MessageSquareQuote, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ElementType } from "react";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminFaqs, adminPlaces, adminReviews, adminTextOverrides, adminTours, adminVehicles } from "@/lib/admin/queries";
import { isTranslationConfigured } from "@/lib/machine-translation";

export const metadata: Metadata = { title: "Dasbor" };

type Count = {
  href: string;
  title: string;
  icon: ElementType;
  shown: number;
  total: number;
};

export default async function DashboardPage() {
  const [tours, vehicles, places, reviews, faqs, text] = await Promise.all([
    adminTours(),
    adminVehicles(),
    adminPlaces(),
    adminReviews(),
    adminFaqs(),
    adminTextOverrides(),
  ]);
  const shown = (items: { published: boolean }[]) => items.filter((item) => item.published).length;
  const counts: Count[] = [
    { href: "/admin/tours", title: "Paket tour", icon: MapIcon, shown: shown(tours), total: tours.length },
    { href: "/admin/fleet", title: "Mobil", icon: Bus, shown: shown(vehicles), total: vehicles.length },
    { href: "/admin/transfers", title: "Tempat", icon: MapPinned, shown: shown(places), total: places.length },
    { href: "/admin/reviews", title: "Ulasan", icon: MessageSquareQuote, shown: shown(reviews), total: reviews.length },
    { href: "/admin/faq", title: "Pertanyaan", icon: CircleHelp, shown: shown(faqs), total: faqs.length },
  ];
  const editedText = Object.values(text).reduce((sum, edits) => sum + Object.keys(edits).length, 0);
  const untranslated = tours.filter((tour) => !tour.text.id || !tour.text.fr);
  const sampleReviews = reviews.filter((review) => review.guestName === "Sample guest" && review.published);

  const checks = [
    {
      ok: isTranslationConfigured(),
      good: "Bahasa Inggris dan Prancis diterjemahkan otomatis dari bahasa Indonesia.",
      bad: "Terjemahan otomatis belum disiapkan: tambahkan GEMINI_API_KEY di server (lihat docs/admin.md).",
    },
    {
      ok: Boolean(process.env.SUPABASE_SECRET_KEY),
      good: "Pengguna admin bisa dikelola di sini.",
      bad: "Tambahkan SUPABASE_SECRET_KEY di server supaya pengguna admin bisa dikelola di sini.",
    },
    {
      ok: sampleReviews.length === 0,
      good: "Semua ulasan yang tampil adalah ulasan asli.",
      bad: `${sampleReviews.length} ulasan contoh masih tampil. Ganti dengan ulasan Google yang asli.`,
    },
    {
      ok: untranslated.length === 0,
      good: "Semua paket sudah ada dalam bahasa Inggris, Indonesia, dan Prancis.",
      bad: `${untranslated.length} paket belum punya bahasa Indonesia atau Prancis; yang tampil bahasa Inggris.`,
    },
  ];

  return (
    <>
      <PageHeader title="Dasbor" />
      <PageBody>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {counts.map((count) => (
            <li key={count.href}>
              <Link href={count.href} className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent">
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <count.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{count.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {count.shown} tampil{count.total > count.shown ? `, ${count.total - count.shown} tersembunyi` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link href="/admin/text" className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500 text-white">
                <Type className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">Teks website</span>
                <span className="block text-xs text-muted-foreground">
                  {editedText === 0 ? "Belum diubah" : `${editedText} perubahan`}
                </span>
              </span>
            </Link>
          </li>
        </ul>

        <section className="mt-8 rounded-xl border">
          <h2 className="border-b px-4 py-3 text-sm font-semibold">Daftar periksa</h2>
          <ul>
            {checks.map((check) => (
              <li key={check.good} className="flex items-start gap-2.5 border-b px-4 py-2.5 text-sm last:border-b-0">
                {check.ok ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                )}
                {check.ok ? check.good : check.bad}
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-6 text-sm text-muted-foreground">
          Perubahan langsung tampil di website begitu disimpan. Kalau Anda mengubah langsung di dashboard Supabase, website
          menyesuaikan dalam satu jam.
        </p>
      </PageBody>
    </>
  );
}
