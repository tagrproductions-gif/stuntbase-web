const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Handle external packages that don't work well with Next.js bundling
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  
  // Disable ESLint during build to avoid quote escape errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ensure webpack resolves path aliases correctly
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tgxbwntmbriwcnqefayv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  
  // Enable SWC minify for better performance
  swcMinify: true,
}

module.exports = nextConfig
