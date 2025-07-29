import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Jangan menjalankan ini di server
    if (!isServer) {
        // Mengabaikan modul khusus server di sisi klien
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'child_process': false,
            'http2': false,
            'fs': false,
            'os': false,
            'crypto': false,
        };
    }

    return config;
  }
};

export default nextConfig;
