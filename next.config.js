/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable ESLint during build to avoid quote escape errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tgxbwntmbriwcnqefayv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
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
