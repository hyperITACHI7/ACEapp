/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@portfolio/db",
    "@portfolio/schema",
    "@portfolio/themes",
    "@portfolio/widgets",
    "@portfolio/ui-kit",
    "@portfolio/integrations",
    "@portfolio/jobs",
  ],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
