/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'content.dropboxapi.com',
        port: '',
        pathname: '/2/files/get_thumbnail_v2',
      },
    ],
  },
};

module.exports = nextConfig;
