import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The embedded Studio uses the force-static route segment configuration.
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
