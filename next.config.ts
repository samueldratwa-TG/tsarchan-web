import type { NextConfig } from "next";
import { OLD_HOST, SITE_HOST } from "./lib/site";

const nextConfig: NextConfig = {
  // Domain migration (MIGRATION.md section 3): the old host answers 308 to the same path on the
  // new host, with the incoming query kept and moved=1 added (the banner in app/layout.tsx
  // reads it). Host-matched, so the new host and the vercel.app alias never redirect.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: OLD_HOST }],
        destination: `https://${SITE_HOST}/:path*?moved=1`,
        permanent: true, // 308
      },
    ];
  },
};

export default nextConfig;
