import { Bus, ChevronRight, Eye, Image as ImageIcon, MapPinned, MessageSquareQuote, Phone, Tag, Type } from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

// The jobs the client does most, each with where to go and what to tap there, so a first visit doesn't start with a
// hunt through the menu.
const commonJobs: { href: string; icon: ElementType; title: string; how: string }[] = [
  { href: "/admin/tours", icon: Tag, title: "Ubah harga atau isi paket tour", how: "Ketuk paketnya; harga ada di bagian Harga." },
  { href: "/admin/tours", icon: Eye, title: "Sembunyikan atau tampilkan paket", how: "Geser tombol di samping nama paket." },
  { href: "/admin/fleet", icon: Bus, title: "Ubah tarif mobil atau antar jemput", how: "Ketuk mobilnya; contoh harga untuk tamu ikut berubah." },
  { href: "/admin/transfers", icon: MapPinned, title: "Tambah tempat antar jemput", how: "Tambah tempat, lalu tempel link Google Maps-nya." },
  { href: "/admin/text", icon: Type, title: "Ubah kalimat di website", how: "Pilih halaman dan bagiannya, atau cari katanya." },
  { href: "/admin/home-photos", icon: ImageIcon, title: "Ganti foto di beranda", how: "Foto besar di atas, empat kotak foto, dan foto sopir." },
  { href: "/admin/reviews", icon: MessageSquareQuote, title: "Tambah ulasan tamu", how: "Salin dari Google, lalu pilih paketnya." },
  { href: "/admin/settings/business", icon: Phone, title: "Ubah nomor WhatsApp atau email", how: "Di Pengaturan, Data usaha." },
];

/** "Mau mengubah apa?": the top of the dashboard, a list of common jobs that each open the right page. */
export function CommonJobs() {
  return (
    <section className="mb-8 rounded-xl border">
      <h2 className="border-b px-4 py-3 text-sm font-semibold">Mau mengubah apa?</h2>
      <ul className="grid sm:grid-cols-2">
        {commonJobs.map((job) => (
          <li key={job.title} className="border-b last:border-b-0 sm:nth-last-2:border-b-0 sm:odd:border-r">
            <Link href={job.href} className="flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent active:bg-accent">
              <job.icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{job.title}</span>
                <span className="block text-xs text-muted-foreground">{job.how}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
