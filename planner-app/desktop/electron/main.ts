import {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Tray,
  Menu,
  globalShortcut,
  Notification,
  protocol,
} from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  createWidgetWindow,
  closeWidgetWindow,
  toggleWidgetVisibility,
  getWidgetWindow,
  showWidgetWindow,
  hideWidgetWindow,
} from './widget-window';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// Safe file reader for protocol handler (works with asar)
function serveFile(filePath: string): Response {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('[protocol] File not found:', filePath);
      return new Response('Not Found', { status: 404, statusText: 'Not Found' });
    }
    const data = fs.readFileSync(filePath);
    const contentType = getMimeType(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    console.error('[protocol] Error reading file:', filePath, e);
    return new Response('Internal Error', { status: 500 });
  }
}

// Load .env file at runtime (works in production next to .exe)
function loadEnvFile() {
  const possiblePaths = [
    path.join(app.getAppPath(), '.env'),
    path.join(process.resourcesPath, '.env'),
    path.join(path.dirname(app.getPath('exe')), '.env'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../.env'),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const eq = line.indexOf('=');
        if (eq > 0 && !line.trim().startsWith('#')) {
          const key = line.slice(0, eq).trim();
          const value = line.slice(eq + 1).trim();
          if (key && value) {
            process.env[key] = value;
          }
        }
      });
      return;
    }
  }
}

loadEnvFile();

// Register custom scheme before app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'planner',
    privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: false, corsEnabled: true },
  },
]);

// Single instance lock disabled — Windows mutex may persist after force kill
// const gotTheLock = app.requestSingleInstanceLock();
// if (!gotTheLock) { app.quit(); process.exit(0); }

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const shownNotifications = new Set<string>();
let notificationTimer: NodeJS.Timeout | null = null;

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Планнер',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('planner://index.html');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (e) => {
    // Minimize to tray instead of quitting
    if (process.platform === 'win32') {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    closeWidgetWindow();
  });

  // Create widget when main window is ready
  createWidgetWindow();
}

function createTray() {
  // Try build/icon.ico (dev or asar), then resources/build/icon.ico (production), then fallback
  let trayPath = path.join(__dirname, '../build/icon.ico');
  if (!fs.existsSync(trayPath)) {
    trayPath = path.join(process.resourcesPath, 'build', 'icon.ico');
  }
  if (!fs.existsSync(trayPath)) {
    trayPath = path.join(__dirname, '../public/tray-icon.svg');
  }
  try {
    tray = new Tray(trayPath);
  } catch (e) {
    console.error('[main] Tray creation failed:', e);
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Открыть Планнер',
      click: () => {
        createMainWindow();
      },
    },
    {
      label: 'Показать/скрыть виджет',
      click: () => {
        toggleWidgetVisibility();
      },
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        if (notificationTimer) clearInterval(notificationTimer);
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Планнер');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    createMainWindow();
  });
}

function registerShortcuts() {
  // Ctrl+Shift+P — toggle main window
  try {
    globalShortcut.register('CommandOrControl+Shift+P', () => {
      if (mainWindow && mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        createMainWindow();
      }
    });
  } catch (e) {
    console.warn('[main] Failed to register Ctrl+Shift+P shortcut:', e);
  }

  // Ctrl+Shift+W — toggle widget
  try {
    globalShortcut.register('CommandOrControl+Shift+W', () => {
      toggleWidgetVisibility();
    });
  } catch (e) {
    console.warn('[main] Failed to register Ctrl+Shift+W shortcut:', e);
  }
}

function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

function startNotificationWatcher() {
  // Check every minute
  notificationTimer = setInterval(() => {
    checkUpcomingNotifications();
  }, 60000);
}

// Store upcoming items received from renderer
let upcomingItems: Array<{
  id: string;
  title: string;
  start_date: string;
  type: string;
}> = [];

function checkUpcomingNotifications() {
  const now = new Date().getTime();
  upcomingItems.forEach((item) => {
    const start = new Date(item.start_date).getTime();
    const diff = start - now;
    // Notify if within 15 minutes and not yet notified
    if (diff > 0 && diff <= 15 * 60 * 1000 && !shownNotifications.has(item.id)) {
      const typeLabel =
        item.type === 'meeting' ? 'Встреча' : item.type === 'task' ? 'Задача' : 'Событие';
      const mins = Math.ceil(diff / 60000);
      showNotification(
        `${typeLabel} через ${mins} мин`,
        item.title
      );
      shownNotifications.add(item.id);
    }
  });
}

// Register custom protocol so index.html and widget.html share the same origin
// (fixes localStorage isolation between file:// URLs)
app.whenReady().then(async () => {
  protocol.handle('planner', (request) => {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname.startsWith('/')) pathname = pathname.slice(1);
    if (!pathname) pathname = 'index.html';
    const filePath = path.join(__dirname, '../dist', pathname);
    return serveFile(filePath);
  });

  createMainWindow();
  createTray();
  registerShortcuts();
  startNotificationWatcher();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit on Windows when window closed; keep tray running
    // app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (notificationTimer) clearInterval(notificationTimer);
});

// IPC handlers
ipcMain.handle('toggle-widget', () => {
  toggleWidgetVisibility();
});

ipcMain.handle('close-widget', () => {
  closeWidgetWindow();
});

ipcMain.handle('get-screen-size', () => {
  const primary = screen.getPrimaryDisplay();
  return {
    width: primary.workAreaSize.width,
    height: primary.workAreaSize.height,
  };
});

// Receive upcoming items from renderer for notifications
ipcMain.on('set-upcoming-items', (_, items: typeof upcomingItems) => {
  upcomingItems = items;
  // Don't clear shownNotifications — otherwise notifications repeat every update
  checkUpcomingNotifications();
});

// Provide env vars to renderer synchronously
ipcMain.on('get-env', (event, key: string) => {
  event.returnValue = process.env[key];
});
