import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdfjs-dist tries to require('canvas') in Node — we don't need it (browser canvas only)
      config.externals = [...(config.externals ?? []), { canvas: "canvas" }];
    }
    return config;
  },
};

export default nextConfig;
