// const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production',
  swcMinify: process.env.NODE_ENV === 'production',
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Fix for 'self is not defined' error with sharp and recharts
    if (isServer) {
      // Exclude sharp and recharts from server-side bundle
      config.externals = config.externals || [];
      config.externals.push({
        'sharp': 'commonjs sharp',
        'recharts': 'commonjs recharts',
        'shiki': 'commonjs shiki'
      });
    }

    // Ensure proper client/server separation for problematic libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Disable vendor chunk splitting to avoid 'self is not defined' error
    config.optimization.splitChunks = false;

    // Tree shaking optimization (only in production to avoid caching conflicts)
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "ideogram.ai",
      },
      {
        protocol: "https",
        hostname: "event-images.50bc8e9aaa1448fe6e9e0b46ebcd64af.r2.cloudflarestorage.com",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },

  // Compression optimization
  compress: true,
  
  // Reduce bundle size
  poweredByHeader: false,
  
  // Optimize static generation
  generateEtags: false,
};

// TODO: Re-enable Contentlayer once dependency issues are resolved
// module.exports = withContentlayer(nextConfig);
module.exports = withBundleAnalyzer(nextConfig);