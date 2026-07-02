/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3007',
        pathname: '/api/v1/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig