/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@slideforge/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
