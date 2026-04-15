import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/analyze",
        destination: "/rent/tools/analyze",
        permanent: true,
      },
      {
        source: "/compare",
        destination: "/rent/tools/compare",
        permanent: true,
      },
      {
        source: "/evaluate/:path*",
        destination: "/rent/tools/evaluate/:path*",
        permanent: true,
      },
      {
        source: "/report/demo",
        destination: "/rent/tools/report",
        permanent: true,
      },
      {
        source: "/report/:path*",
        destination: "/rent/tools/report/:path*",
        permanent: true,
      },
      {
        source: "/result",
        destination: "/rent/tools/result",
        permanent: true,
      },
      {
        source: "/scan",
        destination: "/rent/tools/analyze",
        permanent: true,
      },
    ];
  },
  trailingSlash: false,
};

export default nextConfig;
