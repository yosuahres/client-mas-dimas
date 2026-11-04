import type { NextConfig } from "next";

// Photos uploaded in the admin panel are served from the public "photos" bucket in Supabase Storage.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
