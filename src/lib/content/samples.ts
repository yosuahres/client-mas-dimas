// Sample Gallery photos and articles. supabase/seed.sql puts them in the database (scripts/generate-seed.ts), where the
// client edits or deletes them in /admin/gallery and /admin/articles like any other. The site also shows them while
// Supabase isn't connected.
import type { ArticleRecord, GalleryPhotoRecord } from "@/lib/content/schema";

const caption = (en: string, id: string) => ({ en, id });

export const sampleGallery: GalleryPhotoRecord[] = [
  { photo: "/photos/borobudur.jpg", caption: caption("Sunrise tour to Borobudur", "Tour matahari terbit ke Borobudur") },
  { photo: "/photos/prambanan.jpg", caption: caption("Afternoon at Prambanan", "Sore di Prambanan") },
  { photo: "/photos/merapi.jpg", caption: caption("Jeep lava tour on Merapi", "Jeep lava tour Merapi") },
  { photo: "/photos/bromo.jpg", caption: caption("Private transport Jogja to Bromo", "Private transport Jogja ke Bromo") },
  { photo: "/photos/jomblang.jpg", caption: caption("Jomblang Cave day trip", "Tour sehari ke Goa Jomblang") },
  { photo: "/photos/kraton.jpg", caption: caption("Jogja city tour: the Kraton", "City tour Jogja: Kraton") },
  { photo: "/photos/setumbu.jpg", caption: caption("Waiting for the sun at Setumbu", "Menunggu matahari di Setumbu") },
  { photo: "/photos/ijen.jpg", caption: caption("Night drive to Ijen", "Perjalanan malam ke Ijen") },
  { photo: "/photos/parangtritis.jpg", caption: caption("Sunset at Parangtritis", "Senja di Parangtritis") },
  { photo: "/photos/dieng.jpg", caption: caption("", "") },
  { photo: "/photos/timang.jpg", caption: caption("Timang Beach gondola", "Gondola Pantai Timang") },
  { photo: "/photos/tumpak-sewu.jpg", caption: caption("Tumpak Sewu on the way east", "Tumpak Sewu dalam perjalanan ke timur") },
].map((item, index) => ({ id: `sample-${index + 1}`, published: true, ...item }));

export const sampleArticles: ArticleRecord[] = [
  {
    slug: "sample-merapi-to-bromo-in-four-days",
    publishedOn: "2026-10-05",
    cover: "/photos/bromo.jpg",
    photos: ["/photos/merapi.jpg", "/photos/setumbu.jpg", "/photos/tumpak-sewu.jpg", "/photos/bromo.jpg"],
    published: true,
    sample: true,
    text: {
      en: {
        title: "Sample: from Merapi to Bromo in four days",
        excerpt: "Two guests from Germany crossed Java with one car and one driver, from the slopes of Merapi to sunrise over Bromo.",
        body: `This is a sample article, so you can see how an article looks. Write your own in the admin panel under Artikel.

Our guests landed at YIA in the afternoon. Their driver met them at arrivals and took them to their hotel in Jogja, with a stop for dinner on the way.

## The route

- Jeep lava tour on Merapi
- Sunset at the Merapi gate
- The long drive east to Bromo
- Madakaripura waterfall

## On the road

The drive from Jogja to Bromo takes most of a day. We stopped whenever they wanted: for coffee, for photos of the rice fields, and for lunch at a small warung their driver knew.

At Bromo they rode a jeep up to the viewpoint before dawn and watched the sun come up over the crater.`,
      },
      id: {
        title: "Contoh: dari Merapi ke Bromo dalam empat hari",
        excerpt: "Dua tamu dari Jerman menjelajahi Jawa dengan satu mobil dan satu sopir, dari lereng Merapi sampai matahari terbit di Bromo.",
        body: `Ini contoh artikel, supaya terlihat bentuk sebuah artikel. Tulis artikel Anda sendiri di panel admin, menu Artikel.

Tamu kami mendarat di YIA sore hari. Sopir menjemput di pintu kedatangan dan mengantar ke hotel di Jogja, mampir makan malam di jalan.

## Rutenya

- Jeep lava tour Merapi
- Senja di gerbang Merapi
- Perjalanan panjang ke timur, ke Bromo
- Air terjun Madakaripura

## Di perjalanan

Perjalanan dari Jogja ke Bromo hampir seharian. Kami berhenti kapan pun tamu mau: untuk kopi, foto sawah, dan makan siang di warung langganan sopirnya.

Di Bromo mereka naik jeep ke titik pandang sebelum subuh dan melihat matahari terbit di atas kawah.`,
      },
    },
  },
  {
    slug: "sample-a-day-at-borobudur-and-prambanan",
    publishedOn: "2026-09-29",
    cover: "/photos/borobudur.jpg",
    photos: ["/photos/borobudur.jpg", "/photos/prambanan.jpg"],
    published: true,
    sample: true,
    text: {
      en: {
        title: "Sample: a day at Borobudur and Prambanan",
        excerpt: "A family from Malaysia saw both temples in one day, with an early start to beat the heat.",
        body: `This is a sample article. Write your own in the admin panel under Artikel.

We picked the family up from their hotel at 5 in the morning to be at Borobudur when it opened. By lunch they were back in the city, and in the afternoon we drove to Prambanan for the golden light.`,
      },
      id: {
        title: "Contoh: sehari di Borobudur dan Prambanan",
        excerpt: "Satu keluarga dari Malaysia melihat kedua candi dalam sehari, berangkat pagi sebelum panas.",
        body: `Ini contoh artikel. Tulis artikel Anda sendiri di panel admin, menu Artikel.

Kami menjemput keluarga ini di hotel pukul 5 pagi supaya tiba di Borobudur saat buka. Siang mereka sudah kembali ke kota, dan sore harinya kami ke Prambanan untuk cahaya senja.`,
      },
    },
  },
  {
    slug: "sample-caves-and-beaches-of-gunungkidul",
    publishedOn: "2026-09-12",
    cover: "/photos/jomblang.jpg",
    photos: ["/photos/jomblang.jpg", "/photos/timang.jpg"],
    published: true,
    sample: true,
    text: {
      en: {
        title: "Sample: the caves and beaches of Gunungkidul",
        excerpt: "Down into Jomblang Cave in the morning, across to Timang Beach by gondola in the afternoon.",
        body: `This is a sample article. Write your own in the admin panel under Artikel.

Gunungkidul is two hours south of Jogja. Our guest from France wanted caves and the sea, so we did both in one long day.`,
      },
      id: {
        title: "Contoh: goa dan pantai Gunungkidul",
        excerpt: "Turun ke Goa Jomblang pagi hari, menyeberang ke Pantai Timang dengan gondola sore harinya.",
        body: `Ini contoh artikel. Tulis artikel Anda sendiri di panel admin, menu Artikel.

Gunungkidul dua jam ke selatan Jogja. Tamu kami dari Prancis ingin goa dan laut, jadi kami jalani keduanya dalam satu hari panjang.`,
      },
    },
  },
  {
    slug: "sample-airport-pickup-at-midnight",
    publishedOn: "2026-08-28",
    cover: "/photos/kraton.jpg",
    photos: [],
    published: true,
    sample: true,
    text: {
      en: {
        title: "Sample: an airport pickup at midnight",
        excerpt: "A late flight from Bali, a driver waiting at arrivals, and a quiet drive into the city.",
        body: `This is a sample article without extra photos. Write your own in the admin panel under Artikel.

Flights land at YIA at every hour. Our drivers watch the flight times, so a delay never means waiting alone at the airport.`,
      },
      id: {
        title: "Contoh: jemput bandara tengah malam",
        excerpt: "Penerbangan malam dari Bali, sopir menunggu di kedatangan, lalu perjalanan tenang ke kota.",
        body: `Ini contoh artikel tanpa foto tambahan. Tulis artikel Anda sendiri di panel admin, menu Artikel.

Pesawat mendarat di YIA di jam berapa pun. Sopir kami memantau jadwal penerbangan, jadi keterlambatan tidak membuat tamu menunggu sendirian.`,
      },
    },
  },
];
