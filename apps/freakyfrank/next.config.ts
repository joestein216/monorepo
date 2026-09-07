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
  allowedDevOrigins: [
    'fondue-germicide-coronary.ngrok-free.dev',
    'monorepo-freakyfrank.vercel.app',
  ],
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/electronic-press-kit', 
        permanent: false,              // false creates a 307 temporary redirect
      },
    ]
  },
  // typescript: {
  //   // Dangerously allow production builds to successfully complete 
  //   // even if your project has TypeScript errors.
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
