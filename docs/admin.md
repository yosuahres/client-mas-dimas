# Admin panel: setup and handover

The admin panel lives at `/admin`. Everything a guest reads can be changed there: tour packages and their photos, the photos on the home page, cars and prices, transfer places and popular routes, reviews, the questions page, contact details, and every heading and sentence on the site.

The admin itself is in **Indonesian** and is laid out for a phone, which is where the client does most of the editing (see [Using the admin](#using-the-admin)). The client writes content in **Indonesian only**. When they save, English and French are translated automatically with Gemini (Google AI Studio, free), with Google Cloud Translation as an optional fallback.

Content, admin logins and photos are all stored in **Supabase** (database, Auth and Storage). See `docs/costs.md` for what each costs. Until Supabase is connected, the website shows the content it launched with and `/admin` shows the setup steps.

## 1. Supabase

1. Create a project at supabase.com, under the client's own account. Pick the Singapore region (closest to Jogja).
2. In the project, open **SQL Editor** and run, in this order:
   - `supabase/migrations/20261104000000_site_content.sql` (the tables and access rules)
   - `supabase/migrations/20261104010000_photos_bucket.sql` (the public `photos` bucket, which only admins can upload to)
   - `supabase/migrations/20261108000000_tour_options.sql` (the "with accommodation" option and drop-off points on packages)
   - `supabase/migrations/20261111000000_harden_functions.sql` (pins the helper functions' search path)
   - `supabase/migrations/20261120000000_split_packages_and_car_capacity.sql` (split packages, car luggage capacity and tour price %)
   - `supabase/migrations/20261120010000_car_seat_classes.sql` (5 seater / 7 seater / above 7 groups)
   - `supabase/migrations/20261122000000_home_photos.sql` (the photos the client can swap on /admin/home-photos)
   - `supabase/seed.sql` (the 15 packages, 5 cars, 27 places, routes, reviews and questions the site launched with)
3. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up". Admins are only added from `/admin/settings/users` or by you.
4. **Project Settings → API Keys**: copy the project URL, the publishable key (`sb_publishable_…`) and a secret key (`sb_secret_…`) into the environment (step 3 below).

### The first admin

1. **Authentication → Users → Add user → Create new user**: enter the client's email and a password, and tick "Auto confirm user".
2. In the **SQL Editor**, give that account the admin role:

   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
   where email = 'yarkasi@jogja-transport.com';
   ```

3. Sign in at `/admin/login`. Further admins can be added from **Pengaturan → Pengguna admin** (Settings → Admin users), once `SUPABASE_SECRET_KEY` is set.

Only accounts with that role can sign in, and the database checks the same role before any change, so a leaked publishable key can't be used to edit the site.

## 2. Photos (Supabase Storage)

Nothing to set up beyond the photos bucket migration in step 1: uploads use the admin's own login, and the bucket's policies check the same admin role as the tables. No extra keys are needed.

Photos are resized in the browser to at most 2000 px wide and saved as WebP (usually 150–400 KB) before upload, straight from the browser to Supabase. The bucket refuses anything that isn't WebP or is over 5 MB. Replacing or deleting a package photo deletes the old file. The 15 photos the site launched with stay in `public/photos/` until they're replaced.

The free plan holds 1 GB of files and about 5 GB of downloads a month (see `docs/costs.md`). If the site outgrows that, move photos to Cloudflare R2: the R2 version of the upload code is in git history (commit `847283e`).

## 3. Automatic translation (English and French)

### Gemini (the default: free, no card)

1. Sign in to aistudio.google.com with the client's Google account (any Gmail works).
2. Click **Get API key → Create API key**. Let it create a new project (e.g. "Jogja Travel"). Copy the key into `GEMINI_API_KEY`.
3. Don't turn on billing for that project. Without billing it stays on the free tier: when a limit is reached Google refuses the request and the admin shows a notice, and nothing can ever be charged.

Limits: the free tier allows a number of requests per minute and per day (AI Studio shows the project's current numbers under its rate-limit page). The daily count resets at midnight Pacific time, 15:00 WIB in winter (14:00 WIB in summer). A save is about one request per language, so normal editing stays far below it. Text sent on the free tier may be used by Google to improve its models; it's public website text, so that's fine, but never paste customer details into the admin text fields.

The model is `gemini-3.5-flash-lite`. If Google retires it or takes it off the free tier (saves then say "Gemini menolak permintaan (404 …)"), set `GEMINI_MODEL` to a current Flash-Lite id from ai.google.dev/gemini-api/docs/models.

### Google Cloud Translation (optional fallback, needs billing)

Only if the client is ever fine with a card on file. With both keys set, Google translates whenever Gemini fails; with only this key, Google does all the translation.

1. At console.cloud.google.com, create a project (e.g. "Jogja Travel") under the client's Google account and turn on billing for it. A card is required, but the first 500,000 characters a month are free; the whole site is about 40,000 characters per language, and only changed text is translated.
2. **APIs & Services → Library**: enable **Cloud Translation API**.
3. **APIs & Services → Credentials → Create credentials → API key**. Edit the key: under "API restrictions" choose **Restrict key → Cloud Translation API**. Copy it into `GOOGLE_TRANSLATE_API_KEY`.
4. **Make it impossible to pay anything**: **APIs & Services → Cloud Translation API → Quotas & System Limits**, find the **characters per day** quota (filter for "per day") and set it to **15,000**. That's at most ~465,000 a month, inside the free 500,000. Past the cap, Google refuses the request for the rest of the day and the admin shows a notice; nothing is charged.
5. Optional: **Billing → Budgets & alerts**, a budget of Rp 10,000 with email alerts, as a second safety net.

How it works for the client:

- Every form opens on the **Indonesia** tab. The **Inggris** (English) and **Prancis** (French) tabs are marked "otomatis" (the label is hidden on phones).
- On save, a field's English and French are translated when its Indonesian changed, or when they're empty. A translation corrected by hand on the Inggris or Prancis tab stays until that Indonesian text changes again.
- Words in curly brackets like `{price}` are protected from translation.
- If translation fails (no key, free limit reached, Gemini down), the Indonesian still saves and a notice says English and French weren't updated ("Bahasa Inggris dan Prancis tidak diperbarui: …"). A brand-new item can't be saved without English, since it's the language the site falls back to: try again later or type the English on the Inggris tab.
- In **Teks website** (Website text), saving the Indonesian also updates English and French; **Kembalikan teks asli** (back to original) on the Indonesian puts all three back.

## 4. Google reviews (optional)

The home page can show the business's live Google rating, review count and its best recent reviews, straight from its Google Maps listing. Without this, it shows the rating typed in **Pengaturan → Data usaha** (Settings → Business details) and the quotes from **Ulasan** (Reviews) in the admin.

1. At console.cloud.google.com, in a project with billing on (the Gemini project from step 3 works once billing is turned on, but then Gemini is no longer on the free tier, so a separate project is safer), **APIs & Services → Library**: enable **Places API (New)**.
2. **Credentials → Create credentials → API key**. Restrict it to **Places API (New)** and copy it into `GOOGLE_PLACES_API_KEY`. (A separate key from translation, so each can be turned off on its own.)
3. Find the listing's Place ID: open developers.google.com/maps/documentation/places/web-service/place-id, search for the business as it's named on Google Maps, and copy the ID (starts with `ChIJ…`) into `GOOGLE_PLACE_ID`.
4. **Make it impossible to pay anything**: **APIs & Services → Places API (New) → Quotas & System Limits**, find the request limit for **GetPlace** (Place Details) and set it as low as Google allows (filter for "per day" if it's listed; otherwise the per-minute one). The site asks once a day per language (3 a day, about 90 a month); Google's free allowance for this kind of request is 1,000 a month.

How it behaves:

- Google gives the five reviews it ranks most relevant, not all of them, and translates them into the visitor's language (marked "Translated by Google"). The home page shows up to three of those with 4 or 5 stars.
- It refreshes once a day. If Google can't be reached, the page falls back to the admin's rating and quotes and tries again a few minutes later.
- The client can't pick which Google reviews appear. To show hand-picked quotes instead, remove the two variables.

## 5. Environment variables

Copy `.env.example` to `.env.local` for development. In production, enter the same names in **cPanel → Setup Node.js App → Environment variables**, then restart the app. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are read at build time too, so set them where the site is built (GitHub Actions secrets, or your machine) as well.

## Using the admin

### In Indonesian

Everything in the admin is written in Indonesian: the menu, forms, hints, validation errors, save messages and the login page. There's no language switch. The menu, with the English names this guide also uses:

| Menu | Means | Path |
| --- | --- | --- |
| Dasbor | Dashboard: counts and a setup checklist | `/admin` |
| Paket tour | Tour packages | `/admin/tours` |
| Ulasan | Reviews | `/admin/reviews` |
| Pertanyaan | Questions (FAQ) | `/admin/faq` |
| Teks website | Website text | `/admin/text` |
| Foto beranda | Home page photos | `/admin/home-photos` |
| Mobil & harga | Cars & prices | `/admin/fleet` |
| Tempat & rute | Places & routes | `/admin/transfers` |
| Pengaturan | Settings: Akun (account and password), Data usaha (business details), Pengguna admin (admin users) | `/admin/settings/…` |

The admin uses the website's own Indonesian terms, so the client sees one vocabulary in both: Transport saja / Termasuk akomodasi, Titik antar (drop-off), "5 kursi" for seat groups, sopir, BBM, antar jemput, and "Hubungi kami" where a package has no price. Write any new admin text in Indonesian with these terms.

### On a phone

Below 768 px wide:

- The menu opens from the button at the top left of every page.
- In lists, tapping a row opens it for editing. The switch shows or hides the item on the website, and the **⋯** button opens a sheet from the bottom with Ubah (edit), Naikkan / Turunkan (move up / down), Pindah ke paling atas / bawah (move to the top / bottom) and Hapus (delete). The sheet stays open while moving, so an item can be moved several places in a row.
- Add and edit forms (cars, places, reviews, questions) fill the screen, with the title at the top and Batal / Simpan (cancel / save) pinned at the bottom while the fields scroll.
- Fields, buttons and switches are at least 40 px tall, and save messages appear at the top so they don't cover the Save button.
- Photos can be taken or picked straight from the phone; they're shrunk before upload (see [Photos](#2-photos-supabase-storage)).

On a computer the same pages show the full layout: arrows to reorder, and edit and delete buttons on each row.

### Help built into the forms

The forms avoid asking for anything technical, and show what a change means for guests before it's saved:

- **No web addresses or ids.** Packages, cars and places get theirs from the name when they're added (see [How changes reach the website](#how-changes-reach-the-website)). A package's letter (**Huruf paket**, e.g. A or P2, like Packages A–O on the old site) is the only code left to fill in. It only shows in the admin, to tell packages apart in lists; guests never see it.
- **Tempat (places): Lokasi di Google Maps.** On the phone: open the place in the Google Maps app, tap **Bagikan** (Share), then **Salin link** (Copy link), and paste it. Numbers such as `-7.7956, 110.3695` also work. If a link only searches for a name, the form asks to long-press the spot until a pin appears and share that instead. When editing, **Lihat posisi yang tersimpan di Google Maps** opens the saved position to check it.
- **Mobil (cars): Kursi dan muatan.** The seat group guests choose from (**Kelompok di website**), the seat count written in search results (**Jumlah kursi**), and how many people fit with and without suitcases are grouped together. A **Yang dilihat tamu** (what guests see) box sums them up as they're typed, e.g. *Tampil di kelompok 5 kursi, ditulis “7 kursi”. Ditawarkan untuk rombongan sampai 7 orang, atau 5 orang kalau membawa koper.*
- **Mobil (cars): prices.** Under **Harga paket tour untuk mobil ini (%)** a box shows a real package at that percentage. Under the transfer rates, another shows the first two popular routes with what a guest pays. Both update while typing. The note under the routes says their distances are the site's estimate (straight line × 1.35), so they can differ a little from Google Maps' road distance, and that guests see the same prices as the examples.
- **Teks website (Website text).** Sections start folded, so each tab is a short list of the places text appears (with how many texts each has and how many were changed); tapping one opens its fields. Searching opens every match, and a section with an error opens by itself. Each section's **Lihat** button opens the page where that text appears, in the language being edited. Field labels say where the text shows (e.g. "Label kecil di kartu rute", "Baris di bawah nama paket"), not the name it has in the code.
- **Paket tour (packages): Harga.** Prices have their own section: **Transport saja**, the **Juga dijual termasuk akomodasi** switch with its price, and the split options (**Pilihan sebagian paket**, marked opsional: a package sold only whole leaves it empty, and the website then shows no "What to visit" picker). An empty price shows "Hubungi kami" (contact us) on the website; there are no separate on-request switches. A **Yang dilihat tamu** box shows both prices as guests will see them, e.g. "Mulai Rp 550.000", "Hubungi kami" or "Tidak dijual".
- **Paket tour (packages).** **Kredit foto** (photo credit, only for photos that aren't the client's own) is folded into one line showing the author and licence. It opens by itself if one of its fields has an error.

### The dashboard

**Dasbor** opens with **Mau mengubah apa?** (what do you want to change?): the eight most common jobs, such as changing a package price, adding a place or changing the WhatsApp number. Each opens the right page and says what to tap there. The list is in `src/components/admin/common-jobs.tsx`.

It ends with a short checklist: whether automatic translation works, whether more admins can be added from the admin, whether sample reviews are still shown, and whether any package lacks Indonesian or French. Setup problems are written for the client ("… Minta pembuat website mengaktifkannya": ask whoever built the website to turn it on), with the setting a developer needs in small print underneath, **Untuk pembuat website**: `GEMINI_API_KEY` ([step 3](#3-automatic-translation-english-and-french)) or `SUPABASE_SECRET_KEY` ([step 1](#1-supabase)). If the client forwards one of these, that line says what to set.

## How changes reach the website

Saving in the admin updates the website straight away: each save expires the cached copy of what it changed. Edits made directly in the Supabase dashboard show within an hour.

New packages get their page on first visit. Web addresses and ids are made from the name when a package, car or place is added (the package from its English name, e.g. `/en/tours/borobudur-sunrise`; a taken one gets `-2`). They never change afterwards, even when the item is renamed, so old links keep working. To change one, edit the `slug` or `id` in Supabase (a place's routes point at its id).

## Safety rails

- The website needs at least one shown package and one shown car with a transfer price, so the admin won't hide or delete the last one.
- Indonesian is required everywhere; English is filled by translation, and an empty French field shows the English.
- In **Teks website**, words in curly brackets such as `{price}` are filled in by the site; the editor refuses a save that drops or renames them. **Kembalikan teks asli** puts back the text from `src/i18n/dictionaries`.
- A place's position must be in Indonesia, which catches swapped numbers and wrong links.

## Backups

The Supabase free plan has no backups and pauses after 7 days without activity. Set up the weekly `pg_dump` and daily ping described in `docs/costs.md` before handover.

## Before handover: try it with the client

Give the client their phone, signed in and on the dashboard (`/admin`), and these five jobs without explaining anything first. Change things back afterwards.

1. Change a package's price (**Paket tour**).
2. Hide a package from the website, then show it again.
3. Add a place from a link copied in the Google Maps app (**Tempat & rute → Tambah tempat**).
4. Change a sentence on the home page (**Teks website**, tab **Beranda**, then the section it's in), and check it with **Lihat**.
5. Change a car's per-km rate (**Mobil & harga**) and look at the example prices.

Note where they hesitate, tap the wrong thing or ask what something means; those are the next things to fix. Also note whether they start from **Mau mengubah apa?** on the dashboard or from the menu: if nobody uses the list, it can go.

Afterwards, tell them the one rule the screens can't show on their own: an empty price on a package shows "Hubungi kami" on the website, so clearing a price by mistake doesn't give an error. The **Yang dilihat tamu** box under the prices shows it before saving.

Job 3 is the first real test of short `maps.app.goo.gl` links, which couldn't be tried during development. If the place won't save, note the link and the message shown, and use the numbers from a long press in the meantime (`-7.7956, 110.3695`).

## For developers

- Schema: `supabase/migrations/`. Seed: `node scripts/generate-seed.ts > supabase/seed.sql`, generated from `src/lib/content/defaults.ts` (also the fallback before Supabase is connected).
- Public reads: `src/lib/content/public.ts` (cached with `use cache`, tagged per table in `src/lib/content/store.ts`).
- Admin: `src/app/admin/`, with shared parts in `src/components/admin/` and the shadcn primitives in `src/components/ui/` (used only by the admin). Its Indonesian text is written straight into these files and into the messages in `src/lib/admin/` (no dictionary); field labels on Teks website come from the `names` map in `src/app/admin/(panel)/text/text-form.tsx`. Check new screens at 375 px. Server actions validate with `src/lib/admin/schemas.ts`, write as the signed-in admin (row-level security applies), then call `contentChanged()` to expire the tags.
- Page text edits are stored as dotted paths (`hero.title`) in `page_text` and laid over the dictionaries by `getDictionary()`. Removing a key from the dictionaries simply ignores old edits to it.
- Teks website: each section's **Lihat** page is its `path` in `src/app/admin/(panel)/text/sections.ts` (`{tour}` and `{route}` are filled with a real package and popular route). Dictionary text the site doesn't show is left out of the editor with `unusedKeys` in `text/page.tsx`; add a key there when a component stops using it.
- Place positions: `src/lib/admin/map-location.ts` reads coordinates from Google Maps links (the place's pin `!3d…!4d…` first, then `q=`/`ll=`, then the map centre `@…`) and follows short `maps.app.goo.gl` links on the server, only through Google hosts.
- The car form's examples use the site's own price functions (`src/lib/pricing.ts`), so they match what guests see.
