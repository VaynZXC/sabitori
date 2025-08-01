import type { NextConfig } from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.WatchIgnorePlugin({
          paths: [
            /C:\\DumpStack\.log\.tmp/,
            /C:\\pagefile\.sys/,
            /C:\\hiberfil\.sys/,  // Добавил ещё один системный файл на всякий
          ],
        })
      );
      config.watchOptions = {
        ignored: ['**/node_modules', '**/.git', '**/.next'],  // Игнор лишнего
      };
    }
    return config;
  },
  allowedDevOrigins: ['sabitori.ru', 'localhost'],
};

export default nextConfig;