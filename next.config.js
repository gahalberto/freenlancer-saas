/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  staticPageGenerationTimeout: 60,
  onDemandEntries: {
    // Keep pages in the buffer for longer
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
}

module.exports = nextConfig
