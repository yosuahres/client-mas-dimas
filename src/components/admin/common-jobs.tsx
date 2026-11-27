import { Bus, ChevronRight, Eye, Image as ImageIcon, MapPinned, MessageSquareQuote, Phone, Tag, Type } from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

// The jobs the client does most, each linking to the right page, so a first visit doesn't start with a
// hunt through the menu.
const commonJobs: { href: string; icon: ElementType; title: string }[] = [
  { href: "/admin/tours", icon: Tag, title: "Ubah harga atau isi paket tour" },
  { href: "/admin/tours", icon: Eye, title: "Sembunyikan atau tampilkan paket" },
  { href: "/admin/transfers", icon: MapPinned, title: "Ubah harga atau tempat antar jemput" },
  { href: "/admin/fleet", icon: Bus, title: "Tambah atau ubah mobil" },
  { href: "/admin/text", icon: Type, title: "Ubah kalimat di website" },
  { href: "/admin/home-photos", icon: ImageIcon, title: "Ganti foto di beranda" },
  { href: "/admin/reviews", icon: MessageSquareQuote, title: "Tambah ulasan tamu" },
  { href: "/admin/settings/business", icon: Phone, title: "Ubah nomor WhatsApp atau email" },
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
              <span className="min-w-0 flex-1 text-sm font-medium">{job.title}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
