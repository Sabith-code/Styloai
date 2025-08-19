/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle undici compatibility issue
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        undici: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
      
      // Exclude undici from client-side bundle
      config.externals = config.externals || [];
      config.externals.push('undici');
      
      // Add alias to prevent undici from being bundled
      config.resolve.alias = {
        ...config.resolve.alias,
        undici: false,
      };
    }
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
