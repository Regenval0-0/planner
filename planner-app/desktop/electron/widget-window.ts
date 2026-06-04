import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let widgetWindow: BrowserWindow | null = null;

export function getWidgetWindow() {
  return widgetWindow;
}

export function createWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    return;
  }

  const primary = screen.getPrimaryDisplay();
  const workArea = primary.workAreaSize;

  const width = 340;
  const height = 500;

  widgetWindow = new BrowserWindow({
    width,
    height,
    x: workArea.width - width - 20,
    y: workArea.height - height - 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    show: false,
    opacity: 0.9999999, // Workaround for Windows transparency bug
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  // Highest always-on-top level
  widgetWindow.setAlwaysOnTop(true, 'screen-saver', 1);
  widgetWindow.setIgnoreMouseEvents(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    widgetWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}/widget.html`);
  } else {
    widgetWindow.loadURL('planner://widget.html');
  }

  widgetWindow.once('ready-to-show', () => {
    widgetWindow?.show();
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

export function showWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.show();
  }
}

export function hideWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.hide();
  }
}

export function closeWidgetWindow() {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.close();
    widgetWindow = null;
  }
}

export function toggleWidgetVisibility() {
  if (!widgetWindow || widgetWindow.isDestroyed()) {
    createWidgetWindow();
    return;
  }

  if (widgetWindow.isVisible()) {
    widgetWindow.hide();
  } else {
    widgetWindow.show();
  }
}
