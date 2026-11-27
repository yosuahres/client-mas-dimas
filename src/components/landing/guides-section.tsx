import Image from "next/image";
import Link from "next/link";

import batik from "@/assets/photos/batik.jpg";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getHomePhotos } from "@/lib/content/public";

// A photo feature in a rounded frame with the promise on top of it, on white, so it never touches the hero's photo.
// Phones: a shorter card with the text at the bottom over a dark fade.
export async function GuidesSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).guides;
  // The photo set in /admin/home-photos, otherwise the batik maker
  const replaced = (await getHomePhotos()).drivers;

  return (
    <section aria-labelledby="guides-title" className="px-5 py-9 sm:px-8 sm:py-20 lg:px-12">
      <div className="relative isolate mx-auto flex min-h-[24rem] max-w-[90rem] items-end overflow-hidden rounded-3xl bg-ink text-white sm:block sm:min-h-0">
        <div className="absolute inset-0 -z-10">
          <Image src={replaced ?? batik} alt={t.photoAlt} placeholder={replaced ? "empty" : "blur"} fill sizes="100vw" className="object-cover object-[50%_35%]" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/5 sm:bg-linear-to-r sm:from-black/75 sm:via-black/40 sm:to-black/5" />
        </div>

        <div className="px-6 pt-24 pb-7 sm:px-12 sm:py-24 lg:px-20 lg:py-28">
          <div className="max-w-xl">
            <p className="kicker text-white/80">{t.kicker}</p>
            <h2 id="guides-title" className="display mt-2 text-[clamp(2.25rem,5vw,4rem)] sm:mt-3">
              {t.title}
            </h2>
            <Link href={localePath(locale, "/how-to-book")} className="pill mt-6 bg-white text-ink hover:bg-white/90 sm:mt-8">
              {t.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
