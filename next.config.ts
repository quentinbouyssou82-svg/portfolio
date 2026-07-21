import type { NextConfig } from "next";
import path from "path";

/** Force Turbopack root to this app (avoids parent ~/package-lock.json hijacking). */
const appRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Autorise les assets dev (CSS/JS) quand le site est consulté via ngrok.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.app",
    "*.ngrok.io",
  ],
  turbopack: {
    root: appRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
