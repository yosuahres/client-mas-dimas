# Admin panel: setup and handover

The admin panel lives at `/admin`. Everything a guest reads can be changed there: tour packages and their photos, the photos on the home page, cars and prices, transfer places and popular routes, reviews, the questions page, contact details, and every heading and sentence on the site.

The client writes in **Indonesian only**. When they save, English and French are translated automatically with Gemini (Google AI Studio, free), with Google Cloud Translation as an optional fallback.

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

3. Sign in at `/admin/login`. Further admins can be added from **Settings → Admin users**.

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

The model is `gemini-3.5-flash-lite`. If Google retires it or takes it off the free tier (saves then say "Gemini refused the request (404 …)"), set `GEMINI_MODEL` to a current Flash-Lite id from ai.google.dev/gemini-api/docs/models.

### Google Cloud Translation (optional fallback, needs billing)

Only if the client is ever fine with a card on file. With both keys set, Google translates whenever Gemini fails; with only this key, Google does all the translation.

1. At console.cloud.google.com, create a project (e.g. "Jogja Travel") under the client's Google account and turn on billing for it. A card is required, but the first 500,000 characters a month are free; the whole site is about 40,000 characters per language, and only changed text is translated.
2. **APIs & Services → Library**: enable **Cloud Translation API**.
3. **APIs & Services → Credentials → Create credentials → API key**. Edit the key: under "API restrictions" choose **Restrict key → Cloud Translation API**. Copy it into `GOOGLE_TRANSLATE_API_KEY`.
4. **Make it impossible to pay anything**: **APIs & Services → Cloud Translation API → Quotas & System Limits**, find the **characters per day** quota (filter for "per day") and set it to **15,000**. That's at most ~465,000 a month, inside the free 500,000. Past the cap, Google refuses the request for the rest of the day and the admin shows a notice; nothing is charged.
5. Optional: **Billing → Budgets & alerts**, a budget of Rp 10,000 with email alerts, as a second safety net.

How it works for the client:

- Every form opens on the **Indonesia** tab. The English and French tabs are marked "auto".
- On save, a field's English and French are translated when its Indonesian changed, or when they're empty. A translation corrected by hand on the English or French tab stays until that Indonesian text changes again.
- Words in curly brackets like `{price}` are protected from translation.
- If translation fails (no key, free limit reached, Gemini down), the Indonesian still saves and a notice says English and French weren't updated. A brand-new item can't be saved without English, since it's the language the site falls back to: try again later or type the English.
- In **Website text**, saving the Indonesian also updates English and French; "Back to original" on the Indonesian puts all three back.

## 4. Google reviews (optional)

The home page can show the business's live Google rating, review count and its best recent reviews, straight from its Google Maps listing. Without this, it shows the rating typed in **Settings → Business** and the quotes from **Reviews** in the admin.

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

## How changes reach the website

Saving in the admin updates the website straight away: each save expires the cached copy of what it changed. Edits made directly in the Supabase dashboard show within an hour.

New packages get their page on first visit. Renaming a package's short name changes its web address and breaks old links to it, so the editor warns about it.

## Safety rails

- The website needs at least one shown package and one shown car with a transfer price, so the admin won't hide or delete the last one.
- Indonesian is required everywhere; English is filled by translation, and an empty French field shows the English.
- In **Website text**, words in curly brackets such as `{price}` are filled in by the site; the editor refuses a save that drops or renames them. "Back to original" puts back the text from `src/i18n/dictionaries`.

## Backups

The Supabase free plan has no backups and pauses after 7 days without activity. Set up the weekly `pg_dump` and daily ping described in `docs/costs.md` before handover.

## For developers

- Schema: `supabase/migrations/`. Seed: `node scripts/generate-seed.ts > supabase/seed.sql`, generated from `src/lib/content/defaults.ts` (also the fallback before Supabase is connected).
- Public reads: `src/lib/content/public.ts` (cached with `use cache`, tagged per table in `src/lib/content/store.ts`).
- Admin: `src/app/admin/`. Server actions validate with `src/lib/admin/schemas.ts`, write as the signed-in admin (row-level security applies), then call `contentChanged()` to expire the tags.
- Page text edits are stored as dotted paths (`hero.title`) in `page_text` and laid over the dictionaries by `getDictionary()`. Removing a key from the dictionaries simply ignores old edits to it.
