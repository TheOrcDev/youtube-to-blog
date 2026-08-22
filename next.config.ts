import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async redirects() {
    return [
      {
        destination: "/dashboard",
        permanent: true,
        source: "/blogs",
      },
      {
        destination: "/dashboard/billing",
        permanent: true,
        source: "/account/billing",
      },
      {
        destination: "/dashboard/settings",
        permanent: true,
        source: "/account",
      },
    ];
  },
  async rewrites() {
    return [
      {
        destination: "/opengraph.png",
        source: "/og.png",
      },
      {
        destination: "/opengraph.png",
        source: "/opengraph-image",
      },
      {
        destination: "/opengraph.png",
        source: "/twitter-image",
      },
      {
        destination: "/blog/:slug/opengraph.png",
        source: "/blog/:slug/opengraph-image",
      },
    ];
  },
};

export default nextConfig;
