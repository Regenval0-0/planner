import { Capacitor } from '@capacitor/core';

interface ElectronBridge {
  platform: string;
  version?: string;
  openExternal?: (url: string) => Promise<void>;
}

export function electronApi(): ElectronBridge | undefined {
  return (window as unknown as { electronAPI?: ElectronBridge }).electronAPI;
}

export function isElectron(): boolean {
  return !!electronApi();
}

/** Приложение запущено на Android/iOS (Capacitor). */
export function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function openExternal(url: string) {
  const api = electronApi();
  if (api?.openExternal) {
    api.openExternal(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** UUID v4 (crypto.randomUUID есть не во всех WebView). */
export function uuid(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
