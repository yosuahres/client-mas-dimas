# Admin panel: setup and handover

The admin panel lives at `/admin`. Everything a guest reads can be changed there: tour packages and their photos, cars and prices, transfer places and popular routes, reviews, the questions page, contact details, and every heading and sentence on the site.

The client writes in **Indonesian only**. When they save, English and French are translated automatically with Google Cloud Translation.

Content is stored in **Supabase** (database and admin logins). Photos are stored in **Cloudflare R2**. See `docs/costs.md` for what each costs. Until Supabase is connected, the website shows the content it launched with and `/admin` shows the setup steps.

## 1. Supabase

1. Create a project at supabase.com, under the client's own account. Pick the Singapore region (closest to Jogja).
2. In the project, open **SQL Editor** and run, in this order:
   - `supabase/migrations/20261104000000_site_content.sql` (the tables and access rules)
   - `supabase/seed.sql` (the 15 packages, 5 cars, 27 places, routes, reviews and questions the site launched with)
3. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up". Admins are only added from `/admin/users` or by you.
4. **Project Settings → API**: copy the project URL, the `anon` key and the `service_role` key into the environment (step 3 below).

### The first admin

1. **Authentication → Users → Add user → Create new user**: enter the client's email and a password, and tick "Auto confirm user".
2. In the **SQL Editor**, give that account the admin role:

   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
   where email = 'yarkasi@jogja-transport.com';
   ```

3. Sign in at `/admin/login`. Further admins can be added from **Settings → Admin users**.

Only accounts with that role can sign in, and the database checks the same role before any change, so a leaked anon key can't be used to edit the site.

## 2. Cloudflare R2 (photos)

1. In Cloudflare, **R2 → Create bucket**, e.g. `jogja-transport-photos`. A card must be on file to enable R2; nothing is charged under 10 GB.
2. **Bucket → Settings → Custom Domains**: connect `img.jogja-transport.com` (the domain's DNS must be on Cloudflare). Don't use the `r2.dev` link in production: it's rate-limited.
3. **Bucket → Settings → CORS policy**, so the admin panel can upload straight from the browser:

   ```json
   [
     {
       "AllowedOrigins": ["https://www.jogja-transport.com", "http://localhost:3000"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

4. **R2 → Manage API tokens → Create API token**: permission "Object Read & Write", limited to this bucket. Copy the access key ID, the secret, and the account ID.

Photos are resized in the browser to at most 2000 px wide and saved as WebP (usually 150–400 KB) before upload. Replacing or deleting a package photo deletes the old file from R2. The 15 photos the site launched with stay in `public/photos/` until they're replaced.

## 3. Google Cloud Translation (English and French)

1. At console.cloud.google.com, create a project (e.g. "Jogja Transport") under the client's Google account and turn on billing for it. A card is required, but the first 500,000 characters a month are free; the whole site is about 40,000 characters per language, and only changed text is translated.
2. **APIs & Services → Library**: enable **Cloud Translation API**.
3. **APIs & Services → Credentials → Create credentials → API key**. Edit the key: under "API restrictions" choose **Restrict key → Cloud Translation API**. Copy it into `GOOGLE_TRANSLATE_API_KEY`.
4. **Make it impossible to pay anything**: **APIs & Services → Cloud Translation API → Quotas & System Limits**, find the **characters per day** quota (filter for "per day") and set it to **15,000**. That's at most ~465,000 a month, inside the free 500,000. Past the cap, Google refuses the request for the rest of the day and the admin shows a notice; nothing is charged.
5. Optional: **Billing → Budgets & alerts**, a budget of Rp 10,000 with email alerts, as a second safety net.

How it works for the client:

- Every form opens on the **Indonesia** tab. The English and French tabs are marked "auto".
- On save, a field's English and French are translated when its Indonesian changed, or when they're empty. A translation corrected by hand on the English or French tab stays until that Indonesian text changes again.
- Words in curly brackets like `{price}` are protected from translation.
- If translation fails (no key, quota reached, Google down), the Indonesian still saves and a notice says English and French weren't updated. A brand-new item can't be saved without English, since it's the language the site falls back to: try again later or type the English.
- In **Website text**, saving the Indonesian also updates English and French; "Reset to original" on the Indonesian puts all three back.

## 4. Environment variables

Copy `.env.example` to `.env.local` for development. In production, enter the same names in **cPanel → Setup Node.js App → Environment variables**, then restart the app. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `R2_PUBLIC_URL` are read at build time too, so set them where the site is built (GitHub Actions secrets, or your machine) as well.

## How changes reach the website

Saving in the admin updates the website straight away: each save expires the cached copy of what it changed. Edits made directly in the Supabase dashboard show within an hour.

New packages get their page on first visit. Renaming a package's short name changes its web address and breaks old links to it, so the editor warns about it.

## Safety rails

- The website needs at least one shown package and one shown car with a transfer price, so the admin won't hide or delete the last one.
- Indonesian is required everywhere; English is filled by translation, and an empty French field shows the English.
- In **Website text**, words in curly brackets such as `{price}` are filled in by the site; the editor refuses a save that drops or renames them. "Reset to original" puts back the text from `src/i18n/dictionaries`.

## Backups

The Supabase free plan has no backups and pauses after 7 days without activity. Set up the weekly `pg_dump` and daily ping described in `docs/costs.md` before handover.

## For developers

- Schema: `supabase/migrations/`. Seed: `node scripts/generate-seed.ts > supabase/seed.sql`, generated from `src/lib/content/defaults.ts` (also the fallback before Supabase is connected).
- Public reads: `src/lib/content/public.ts` (cached with `use cache`, tagged per table in `src/lib/content/store.ts`).
- Admin: `src/app/admin/`. Server actions validate with `src/lib/admin/schemas.ts`, write as the signed-in admin (row-level security applies), then call `contentChanged()` to expire the tags.
- Page text edits are stored as dotted paths (`hero.title`) in `page_text` and laid over the dictionaries by `getDictionary()`. Removing a key from the dictionaries simply ignores old edits to it.
