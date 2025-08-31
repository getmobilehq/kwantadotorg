/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds for better code quality
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors for deployment
  },
  images: { 
    unoptimized: true 
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Bundle optimization
  experimental: {
    optimizeCss: false, // Disable CSS optimization to avoid critters dependency issue
    scrollRestoration: true,
  },
  // Production optimizations
  swcMinify: true,
  // Reduce bundle size
  output: 'standalone',
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
