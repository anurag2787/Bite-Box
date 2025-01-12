/** @type {import('next').NextConfig} */
const nextConfig = {

    // next.config.js
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
        {
          protocol: 'https',
          hostname: '**',
        },
      ],
    },
    trailingSlash: true,
    reactStrictMode: false,
    images: {
      unoptimized: true,
    },
  
};

export default nextConfig;
