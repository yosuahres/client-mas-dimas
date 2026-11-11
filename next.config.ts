import type { NextConfig } from "next";

// Photos uploaded in the admin panel are served from the public "photos" bucket in Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
const isDev = process.env.NODE_ENV === "development";

// No nonces: pages are prerendered (cacheComponents), so their inline scripts can't carry a per-request nonce.
// The policy still stops framing, plugin content, <base> hijacking, forms posting elsewhere, and scripts,
// requests or images from any origin but this site and the Supabase project (photo uploads and photos).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' blob: data: ${supabaseOrigin}`.trim(),
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin}${isDev ? " ws:" : ""}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // For browsers that predate frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Browsers ignore this over plain http, so local runs are unaffected. No includeSubDomains: the domain's
  // other subdomains (webmail, cPanel) aren't ours to promise https for.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  headers: async () => [
    { source: "/:path*", headers: securityHeaders },
    // robots.txt already asks crawlers to stay out; this also covers links from elsewhere.
    { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
  ],
  // Self-contained server in .next/standalone, for the Docker image and the cPanel upload. Off for plain `next build`.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  partialPrefetching: true,
  // Settings moved into their own area; old bookmarks still land on the right page.
  redirects: async () => [
    { source: "/admin/users", destination: "/admin/settings/users", permanent: false },
    { source: "/admin/account", destination: "/admin/settings/account", permanent: false },
  ],
  ...(supabaseUrl && {
    images: {
      remotePatterns: [new URL(`${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/photos/**`)],
    },
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
