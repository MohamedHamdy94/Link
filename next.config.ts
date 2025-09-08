import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com']
  }
};

export default withPWA(withBundleAnalyzer(nextConfig));
