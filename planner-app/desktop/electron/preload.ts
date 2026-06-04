import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  toggleWidget: () => Promise<void>;
  closeWidget: () => Promise<void>;
  getScreenSize: () => Promise<{ width: number; height: number }>;
  onWidgetCommand: (callback: (command: string) => void) => () => void;
  setUpcomingItems: (items: Array<{ id: string; title: string; start_date: string; type: string }>) => void;
  getEnv: (key: string) => string | undefined;
  supabaseUrl: string;
  supabaseKey: string;
}

const electronAPI: ElectronAPI = {
  toggleWidget: () => ipcRenderer.invoke('toggle-widget'),
  closeWidget: () => ipcRenderer.invoke('close-widget'),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  onWidgetCommand: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, command: string) => callback(command);
    ipcRenderer.on('widget-command', handler);
    return () => ipcRenderer.removeListener('widget-command', handler);
  },
  setUpcomingItems: (items) => {
    ipcRenderer.send('set-upcoming-items', items);
  },
  getEnv: (key: string) => ipcRenderer.sendSync('get-env', key),
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || '',
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
