/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'i.imgur.com',
      'imagedelivery.net',
      'res.cloudinary.com',
      'warpcast.com',
      'avatars.githubusercontent.com',
      'zora.co',
      'ipfs.io'
    ],
  },
  async rewrites() {
    return [
      // Farcaster image rewrites - static paths to API routes
      { source: '/icon.png', destination: '/api/images/icon' },
      { source: '/splash.png', destination: '/api/images/splash' },
      { source: '/hero.png', destination: '/api/images/hero' },
      { source: '/image.png', destination: '/api/og' },
      { source: '/og.png', destination: '/api/og' },
      { source: '/screenshot.png', destination: '/api/images/screenshot' },
      { source: '/screenshot1.png', destination: '/api/images/screenshot1' },
      { source: '/screenshot2.png', destination: '/api/images/screenshot2' },
      { source: '/screenshot3.png', destination: '/api/images/screenshot3' },
    ];
  },
  async headers() {
    return [
      {
        // Allow Farcaster and Base Mini App to embed in iframe
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://warpcast.com https://*.warpcast.com https://farcaster.xyz https://*.farcaster.xyz https://wallet.coinbase.com https://*.coinbase.com",
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
