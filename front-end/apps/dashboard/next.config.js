import createNextIntlPlugin from "next-intl/plugin";

export const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Keep NextAuth handled by Next.js
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
      // Proxy the rest
      {
        source: "/api/:path*",
        destination: "/api/proxy/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
