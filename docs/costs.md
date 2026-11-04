# Running costs: Jogja Travel website

Prices are estimates as of November 2026, at about Rp 16,500 per USD. Check them on the vendor's site before you quote the client.

## Must pay

| Item | What it's for | Cost | Notes |
|---|---|---|---|
| Domain renewal (jogja-transport.com) | The site address | ~Rp 150k–250k / year | The client already owns it. Only renewal applies; point the DNS at the new host. |
| cPanel hosting with Node.js | Runs the Next.js site and the admin panel | ~Rp 30k–80k / month (~Rp 400k–1M / year on an annual plan) | It **must** have "Setup Node.js App" (CloudLinux) with Node 20.9 or newer, because Next 16 needs a server for the admin panel, `proxy.ts` and i18n. A static-only plan won't work. Pick one with at least 1 GB RAM. Build locally or in GitHub Actions, then upload the `standalone` output, since shared hosting often runs out of memory during `next build`. Cheapest Indonesian candidates (Nov 2026 promo prices): Jagoan Hosting from Rp 25k/mo, Qwords from Rp 29k/mo, Rumahweb Large Rp 49.9k/mo, Biznet Gio Large Rp 51k/mo. |

## Free, and enough for this site

| Item | What it's for | Free limit | Will we hit it? | Paid tier if needed |
|---|---|---|---|---|
| Supabase database | Articles, 15 tour packages, fleet, transfers | 500 MB | No. Text data stays well under 50 MB. | Pro $25/mo (~Rp 410k) |
| Supabase Storage (used now for photos) | Article and package photos uploaded from the admin panel | 1 GB files, ~5 GB egress / month | Not if photos are compressed before upload (they are: WebP, ≤ 400 KB): about 3,000 photos fit. Egress is the tighter limit on a busy month. | Pro: 100 GB storage, 250 GB egress |
| Cloudflare R2 (upgrade path for photos) | Same as above, if Supabase Storage runs short | 10 GB storage, 1M uploads + 10M reads / month, **egress always free** | No. About 30,000 compressed photos fit. | $0.015 / GB / month beyond 10 GB |
| Supabase Auth | Admin login | 50,000 users / month | No. A handful of admins. | — |
| SSL certificate | https | Free AutoSSL / Let's Encrypt in cPanel | — | — |
| Domain email (yarkasi@jogja-transport.com) | Business email | Included with cPanel hosting | — | — |
| Cloudflare (DNS + CDN) | Speed for foreign visitors, DDoS protection | Free plan | — | — |
| Cloudflare Turnstile | Anti-spam on contact/booking forms | Free | — | — |
| Google Cloud Translation | Translates the client's Indonesian into English and French in the admin panel | 500,000 characters / month (needs billing on, card on file) | No. The site is ~40,000 characters per language and only changed text is translated. Cap the daily quota at 15,000 characters (docs/admin.md) so it can never be charged. | $20 per million characters |
| Resend (form emails) | Sends booking enquiries to the owner's inbox | 3,000 emails / month, 100 / day | No | $20/mo |
| GitHub | Code, plus Actions for build/deploy and DB backups | Free private repos, 2,000 Action minutes / month | No | — |
| WhatsApp links (wa.me) | Booking via WhatsApp | Free | — | WhatsApp Business API is paid; not needed |
| Google Maps embed | Maps on pages | Free (Embed API) | — | — |
| Google Analytics + Search Console | Traffic and SEO | Free | — | — |
| Google Business Profile | The 4.9 rating and reviews | Free | — | — |
| Wikimedia Commons photos | Site photos | Free, credit required (already in `src/lib/photo-credits.ts`) | — | — |

### Supabase free plan: catches to plan for

| Catch | Risk | What we do |
|---|---|---|
| Free projects **pause after 7 days with no activity** | If pages are cached and nobody opens the admin, the DB can pause and the site breaks | Daily GitHub Actions cron that pings the DB (free) |
| **No backups** on the free plan | Losing articles or packages | Weekly `pg_dump` + storage export via GitHub Actions to a private repo or Google Drive (free) |
| **Image transformations** (resize on the fly) are Pro-only | — | Use `next/image` on the server instead |
| Limit of 2 active free projects per account | — | Make the project under the client's account, or under one used only for this client |

### Cloudflare R2 (if we switch photos to it): catches

| Catch | What we do |
|---|---|
| A card or PayPal must be on file to turn R2 on, even on the free tier | Use the client's card. Nothing gets charged under 10 GB. |
| The default `r2.dev` link is rate-limited and not meant for production | Serve photos from a subdomain such as `img.jogja-transport.com`, which needs the domain's DNS on Cloudflare (free) |
| R2 only stores files, not searchable text | Article and package text stays in the Supabase database. Each row stores the photo's R2 key. |

**When to move to Supabase Pro ($25/mo):** storage goes past 1 GB, egress past 5 GB/month, or the client wants daily backups without the cron setup.

## Optional, client decides

| Item | What it's for | Cost | Notes |
|---|---|---|---|
| Basel Grotesk web licence (Optimo) | The sunday.ai headline font | Est. $200–500 one-time for 2–3 weights | Priced by monthly pageviews. Ask Optimo for a quote. Until then the site uses Geist. |
| Styrene B web licence (Commercial Type) | The sunday.ai body font | Est. $200–500 one-time for 2–3 weights | Priced by pageviews. Until then the site uses Manrope. |
| Professional photos of their cars and drivers | Replaces Wikimedia photos with their own | Photographer's rate | Their current package images are text banners and can't be used as photos. |
| Payment gateway (Midtrans / Xendit) | Online deposit or payment | No monthly fee; ~0.7–3% + Rp ~4k per transaction | Only needed if they stop taking bookings over WhatsApp. |
| Vercel Pro (instead of cPanel) | Easier hosting for Next.js | $20/mo (~Rp 330k) | Hobby (free) doesn't allow commercial sites. |

## Total

| Scenario | Year 1 | After that |
|---|---|---|
| Minimum (cPanel + domain, Supabase free) | **~Rp 0.6–1.3M / year** | Same |
| With Supabase Pro | + ~Rp 4.9M / year | |
| With both font licences | + ~Rp 6.5–16M one-time | Rp 0 (perpetual web licence, within the pageview tier) |
