/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["api.vrchat.cloud", "files.vrchat.cloud"],
  },
};

module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
};
