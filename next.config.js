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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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
