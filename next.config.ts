import type { NextConfig } from 'next'

const config: NextConfig = {
  serverExternalPackages: ['@neondatabase/serverless'],
  // Every page reads live data. no-store also keeps browsers from serving a stale
  // copy on back/forward navigation.
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] }]
  },
}

export default config
