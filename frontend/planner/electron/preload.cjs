const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  setBackendUrl: (url) => ipcRenderer.invoke('set-backend-url', url),
  getLocalIp: () => ipcRenderer.invoke('get-local-ip'),
  platform: process.platform,
});
