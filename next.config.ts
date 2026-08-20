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
};

export default nextConfig;
