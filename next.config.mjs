/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  transpilePackages: ["three"],
  images: {
    remotePatterns: [
      // Poly Pizza CDN — used when POLY_PIZZA_API_KEY is set and a real model
      // thumbnail is surfaced. Add other trusted model hosts here as needed.
      { protocol: "https", hostname: "**.poly.pizza" },
      { protocol: "https", hostname: "cdn.poly.pizza" },
      { protocol: "https", hostname: "static.poly.pizza" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
