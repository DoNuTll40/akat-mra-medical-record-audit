// next.config.mjs
import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,   // เช่น "/mra"
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  images: { unoptimized: true },
  experimental: { authInterrupts: true },

  // ✅ redirects ต้องเป็น async function
  async redirects() {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    if (!base) return []
    return [
      // ส่งเฉพาะ "/" ไปยัง basePath พอ
      {
        source: '/',
        destination: base,     // เช่น "/mra"
        permanent: false,
        basePath: false,       // กันการโดนเติม basePath ซ้ำ
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig)
