import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Allow narrowing remotePatterns to a single Supabase project hostname at
// build time. Set NEXT_PUBLIC_SUPABASE_URL to your real project URL and we
// will only allow that exact host (tighter than `*.supabase.co`).
const supabaseHost = (() => {
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return u ? new URL(u).hostname : null;
  } catch {
    return null;
  }
})();

/** Security headers — applied to all routes. */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // CSP: tightened from report-only to enforced.
    // stripe.com + js.stripe.com needed for Stripe Checkout.
    // supabase.co for auth/storage.
    // vercel-insights for analytics.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' js.stripe.com vercel-insights.vercel.app va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: *.supabase.co images.unsplash.com i.pravatar.cc",
      "font-src 'self'",
      "connect-src 'self' *.supabase.co api.stripe.com va.vercel-scripts.com vercel-insights.vercel.app",
      "frame-src js.stripe.com hooks.stripe.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "motion",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
    // Allowlist de origins para Server Actions (defensa anti CSRF / host spoof).
    serverActions: {
      allowedOrigins: ["getcleaners.nl", "www.getcleaners.nl", "localhost:3000", "localhost:3100", "*.vercel.app"],
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage — profile photos, uploads, etc.
      supabaseHost
        ? { protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }
        : { protocol: "https" as const, hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Unsplash — mock cleaner photos (dev/staging)
      { protocol: "https" as const, hostname: "images.unsplash.com" },
    ],
  },
};

const configWithHeaders: NextConfig = {
  ...config,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(configWithHeaders);
