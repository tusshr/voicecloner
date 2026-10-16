/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: deploys to Cloudflare Pages (or any static host) as plain files.
  output: 'export',
  images: { unoptimized: true },
  experimental: { globalNotFound: true },
}

export default nextConfig
