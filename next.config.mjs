const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/:path*',
          destination: 'https://power.msbglobals.com/:path*'
        }
      ];
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: '*'
            },
            {
              key: 'X-Frame-Options',
              value: 'ALLOWALL'
            }
          ]
        }
      ];
    }
  };
  
  export default nextConfig;
