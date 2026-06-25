import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@slideforge/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@slideforge/ui'],
  },
}

export default nextConfig
