import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Transpile local workspace packages
  transpilePackages: ['@atlas/types', '@atlas/utils'],

  experimental: {
    // Faster local dev builds
    turbo: {},
  },

  images: {
    remotePatterns: [
      // Restaurant menu images from CDN
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },

  // Security headers
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

  // Redirect /health → API health check
  async redirects() {
    return []
  },
}

export default nextConfig
