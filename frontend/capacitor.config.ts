import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asadbek.app',
  appName: 'Asadbek',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    cleartext: true
  }
};

export default config;