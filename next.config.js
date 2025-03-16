const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  staticPageGenerationTimeout: 180,
  output: 'standalone',
  experimental: {
    // appDir foi removido pois não é mais necessário nas versões recentes do Next.js
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
