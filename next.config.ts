import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '5e794ca2e8862a9aa01f71d22a4bc140.r2.cloudflarestorage.com',
      },
      {
        protocol: 'http',
        hostname: '5e794ca2e8862a9aa01f71d22a4bc140.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-0d09e9dbdb334949bc64fece4edb6ce5.r2.dev',
      },
      {
        protocol: 'http',
        hostname: 'pub-0d09e9dbdb334949bc64fece4edb6ce5.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'rjtraditional.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-0b3b356f326a439a96112684b5c6a11d.r2.dev',
      }
    ],
  },

  env: {
    
  }
  
};

export default nextConfig;
