import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
  allowedDevOrigins: ['fondue-germicide-coronary.ngrok-free.dev'],
  devIndicators: false,
};

export default nextConfig;
