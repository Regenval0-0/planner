import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Имя пакета в RuStore. После первой публикации менять нельзя.
  appId: 'com.planner.app',
  appName: 'Планер',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#4f46e5',
      androidSplashResourceName: 'splash',
    },
    LocalNotifications: {
      iconColor: '#4F46E5',
    },
  },
};

export default config;
