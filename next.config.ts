import type { NextConfig } from "next";

const pages = process.env.GITHUB_PAGES === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  ...(pages
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  ...(basePath ? { basePath } : {}),
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
