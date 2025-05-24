import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  // APIルートのボディサイズ制限を増加
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // 外部パッケージの処理
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
