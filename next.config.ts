import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com']
  }
};

export default withBundleAnalyzer(nextConfig);
