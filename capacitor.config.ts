import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fennec.academy',
  appName: 'Fennec',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    androidScheme: 'https',
  },
  ios: {
    scheme: 'fennec-academy',
  },
};

export default config;
