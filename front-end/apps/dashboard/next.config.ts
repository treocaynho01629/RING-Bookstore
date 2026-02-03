import createNextIntlPlugin from "next-intl/plugin";

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

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
