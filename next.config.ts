import type { NextConfig } from "next";
import path from "path";

/** Force Turbopack root to this app (avoids parent ~/package-lock.json hijacking). */
const appRoot = path.resolve(__dirname);

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      // Next.js / analytics / Supabase realtime
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://vercel.live https://*.posthog.com https://eu.i.posthog.com",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://vercel.live",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

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
  async redirects() {
    return [
      {
        source: "/demos/uberly",
        destination: "/demos/driveely",
        statusCode: 301,
      },
      {
        source: "/demos/uberly/:path*",
        destination: "/demos/driveely/:path*",
        statusCode: 301,
      },
      {
        source: "/api/uberly",
        destination: "/api/driveely",
        statusCode: 301,
      },
      {
        source: "/api/uberly/:path*",
        destination: "/api/driveely/:path*",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
