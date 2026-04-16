import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nrpsqvmdmsfekemtrbcz.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] }
  }
}

export default nextConfig
