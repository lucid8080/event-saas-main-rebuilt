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
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Separate heavy UI libraries
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 20,
        },
        // Separate cloud services
        cloud: {
          test: /[\\/]node_modules[\\/](@aws-sdk|@google-cloud|googleapis)[\\/]/,
          name: 'cloud-services',
          chunks: 'all',
          priority: 15,
        },
        // Separate image processing
        images: {
          test: /[\\/]node_modules[\\/](sharp|shiki)[\\/]/,
          name: 'image-processing',
          chunks: 'all',
          priority: 15,
        },
        // Separate charts and animations
        charts: {
          test: /[\\/]node_modules[\\/](recharts|framer-motion|swiper)[\\/]/,
          name: 'charts-animations',
          chunks: 'all',
          priority: 15,
        },
      },
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