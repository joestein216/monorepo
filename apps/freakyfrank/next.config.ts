if (typeof process !== 'undefined') {
  process.on('unhandledRejection', (reason) => {
    console.log('=== UNMASKED EXCEPTION ===');
    if (reason && typeof reason === 'object') {
      // Dump the hidden structure of the browser event
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      console.log(require('util').inspect(reason, { showHidden: true, depth: null }));
    } else {
      console.log(reason);
    }
    console.log('==========================');
  });
}
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
    'monorepo-freakyfrank-kps5upntv-joe-steins-projects-a16d1c4b.vercel.app'
  ],
  devIndicators: false,
  typescript: {
    // Dangerously allow production builds to successfully complete 
    // even if your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
