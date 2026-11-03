import type { NextConfig } from "next";

// Photos uploaded in the admin panel are served from the R2 bucket's public origin (e.g. https://img.jogja-transport.com).
const r2PublicUrl = process.env.R2_PUBLIC_URL;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  ...(r2PublicUrl && {
    images: {
      remotePatterns: [new URL(`${r2PublicUrl.replace(/\/$/, "")}/**`)],
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
