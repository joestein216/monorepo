// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    loader: 'custom', // Use a custom loader for Sanity images
    loaderFile: './sanity/lib/sanityImageLoader.ts', // Path to your custom loader
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig;
