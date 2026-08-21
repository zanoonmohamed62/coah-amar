import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  // Turbopack (Next.js 16 default) — stub the native `canvas` module that
  // pdfjs-dist tries to require in Node context. We only use the browser canvas.
  turbopack: {
    resolveAlias: {
      canvas: "./src/lib/empty-module.js",
    },
  },
};

export default nextConfig;
