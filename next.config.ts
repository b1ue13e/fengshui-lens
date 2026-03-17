import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // 确保支持动态路由
  trailingSlash: false,
  // 强制重新构建所有页面
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

export default nextConfig;
