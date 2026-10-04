import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the plain-files version that is uploaded to S3 + CloudFront (see `npm run deploy:aws`).
// The server-side `redirects()` / `headers()` below cannot run there: the CloudFront function and the upload
// script (`scripts/deploy-aws.sh`) provide the equivalent behaviour.
const exporting = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(exporting ? { output: "export" as const } : {}),
  // The live site mixes forms: marketing pages end in "/", blog posts do not. Serve both without
  // redirecting so every existing URL answers 200 exactly as before; canonicals pick the preferred form.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // Vercel Analytics is served by the platform (/_vercel/insights/*). Elsewhere the script would 404, so it is
  // only rendered when the build runs on Vercel (or when ANALYTICS=vercel is set explicitly).
  env: { VERCEL_ANALYTICS: process.env.VERCEL || process.env.ANALYTICS === "vercel" ? "1" : "" },
  images: { formats: ["image/avif", "image/webp"], ...(exporting ? { unoptimized: true } : {}) },
  experimental: { optimizePackageImports: ["lucide-react", "@react-three/drei", "motion"] },
  ...(exporting ? {} : {
    async redirects() {
      return [
        // Live site: /usa 301s to the home page. Point it at the US landing page instead.
        { source: "/usa", destination: "/react-native-app-development-usa/", permanent: true },
        { source: "/usa/", destination: "/react-native-app-development-usa/", permanent: true },
        { source: "/hire-developers", destination: "/hire/", permanent: true },
        { source: "/hire-developers/", destination: "/hire/", permanent: true },
        // Old-site paths Google still reports as 404 (Search Console, Page indexing)
        { source: "/portfolio", destination: "/work/", permanent: true },
        { source: "/portfolio/:slug*", destination: "/work/", permanent: true },
        { source: "/case-study", destination: "/work/", permanent: true },
        { source: "/estimate", destination: "/app-cost-calculator/", permanent: true },
        { source: "/services/enterprise-software-development", destination: "/services/", permanent: true },
      ];
    },
    async headers() {
      return [{ source: "/assets/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
    },
  }),
};

export default nextConfig;
