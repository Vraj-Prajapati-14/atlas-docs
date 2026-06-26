/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Transpile local workspace packages
  transpilePackages: ['@atlas/types', '@atlas/utils'],

  experimental: {
    turbo: {},
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ]
  },

  async redirects() {
    return []
  },
}

export default nextConfig
