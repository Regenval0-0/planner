import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.planner.app',
  appName: 'Планер',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4f46e5',
      androidSplashResourceName: 'splash',
    },
    LocalNotifications: {
      // smallIcon omitted — uses system default (avoids crash if custom icon missing)
      iconColor: '#4F46E5',
    },
  },
};

export default config;
