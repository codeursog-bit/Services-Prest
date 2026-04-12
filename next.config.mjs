/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'bcrypt': 'bcrypt',
    })
    return config
  },
}

export default nextConfig