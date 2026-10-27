import pkg from './package.json' with { type: 'json' }

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: deploys to Cloudflare Pages, Vercel or any static host as plain files.
  output: 'export',
  images: { unoptimized: true },
  experimental: { globalNotFound: true },
  // The version from package.json, shown in the footer.
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },
}

export default nextConfig
