import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'software.vertice.xbrain',
  appName: 'xbrain',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
