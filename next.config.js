const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 180,
  // output: "standalone",
  experimental: {
    // Removendo configurações experimentais problemáticas
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,   // 1 minuto
    pagesBufferLength: 5,
  },
  // Compressão e otimização de imagens
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: process.env.NODE_ENV === 'development' ? 0 : 60, // 0 em dev, 1 minuto em prod
  },
  // Configurações de compilação e cache
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configura cabeçalhos de cache para recursos estáticos
  async headers() {
    // Em desenvolvimento, desabilitar cache
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Expires', 
              value: '0',
            },
          ],
        },
      ];
    }
    
    // Em produção, manter cache para recursos estáticos
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
