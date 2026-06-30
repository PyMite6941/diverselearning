/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  experimental: {
    // Tree-shake the large drei barrel so only used helpers are bundled.
    optimizePackageImports: ["@react-three/drei"],
  },
};

export default nextConfig;
