/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ksbxmtcghitzmceyadna.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Filesystem cache is noisy and flaky on this Windows + OneDrive workspace.
    // Keeping Webpack cache in memory avoids PackFileCacheStrategy serialization overhead.
    config.cache = {
      type: 'memory',
    };

    return config;
  },
};

module.exports = nextConfig;
