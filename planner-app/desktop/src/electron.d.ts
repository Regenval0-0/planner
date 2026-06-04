export {};

declare global {
  interface Window {
    electronAPI: {
      toggleWidget: () => Promise<void>;
      closeWidget: () => Promise<void>;
      getScreenSize: () => Promise<{ width: number; height: number }>;
      onWidgetCommand: (callback: (command: string) => void) => () => void;
      setUpcomingItems: (items: Array<{ id: string; title: string; start_date: string; type: string }>) => void;
      getEnv: (key: string) => string | undefined;
      supabaseUrl: string;
      supabaseKey: string;
    };
  }
}
