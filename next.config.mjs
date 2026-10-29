/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    const noStore = [
      { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
      { key: "CDN-Cache-Control", value: "no-store" },
      { key: "Vercel-CDN-Cache-Control", value: "no-store" },
    ];
    return [
      { source: "/", headers: noStore },
      { source: "/vehicles", headers: noStore },
      { source: "/vehicles/:path*", headers: noStore },
      { source: "/booking", headers: noStore },
      { source: "/booking/:path*", headers: noStore },
      { source: "/admin/vehicles", headers: noStore },
      { source: "/admin/vehicles/:path*", headers: noStore },
      { source: "/api/vehicles", headers: noStore },
      { source: "/api/vehicles/:path*", headers: noStore },
    ];
  },
};

export default nextConfig;
