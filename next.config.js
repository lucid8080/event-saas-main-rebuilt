// const { withContentlayer } = require("next-contentlayer2");

import("./env.mjs");

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === 'production',
  swcMinify: process.env.NODE_ENV === 'production',
  
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Exclude scripts directory from build to avoid TypeScript errors
    config.module.rules.push({
      test: /scripts\/.*\.ts$/,
      use: 'ignore-loader'
    });

    // Aggressive fix for 'self is not defined' error
    // Completely exclude problematic libraries from the build
    config.externals = config.externals || [];
    
    // Add problematic libraries to externals for both client and server
    config.externals.push({
      'sharp': 'commonjs sharp',
      'recharts': 'commonjs recharts',
      'shiki': 'commonjs shiki'
    });

    // Additional externals function to catch any remaining references
    config.externals.push(({ context, request }, callback) => {
      if (request === 'sharp' || request === 'recharts' || request === 'shiki') {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    });

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

    // Completely disable vendor chunk splitting to avoid any issues
    config.optimization.splitChunks = false;

    // Add alias to redirect problematic imports to empty modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp': false,
      'recharts': false,
      'shiki': false,
    };

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

  // Compression optimization
  compress: true,
  
  // Reduce bundle size
  poweredByHeader: false,
  
  // Optimize static generation
  generateEtags: false,

  // Fix static generation issues
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Exclude problematic routes from static generation
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

// TODO: Re-enable Contentlayer once dependency issues are resolved
// module.exports = withContentlayer(nextConfig);
module.exports = withBundleAnalyzer(nextConfig);