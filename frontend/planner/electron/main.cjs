const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 3001;
const HEALTH_URL = `http://localhost:${BACKEND_PORT}/health`;

// Config file for cloud URL (optional)
const configPath = path.join(app.getPath('userData'), 'planner-config.json');
function readConfig() {
  try {
    if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {}
  return {};
}
function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

ipcMain.handle('get-backend-url', () => readConfig().backendUrl || '');
ipcMain.handle('set-backend-url', (_event, url) => {
  const config = readConfig();
  config.backendUrl = url;
  writeConfig(config);
  return true;
});

// Embedded backend paths
function getBackendDir() {
  if (isDev) {
    return path.join(__dirname, '..', '..', '..', 'backend', 'planner');
  }
  return path.join(process.resourcesPath, 'backend', 'planner');
}

function isBackendRunning() {
  return new Promise((resolve) => {
    const req = http.get(HEALTH_URL, { timeout: 800 }, (res) => resolve(res.statusCode === 200));
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => { req.destroy(); resolve(false); });
  });
}

function waitForBackend(maxMs = 30000) {
  const start = Date.now();
  return new Promise((resolve) => {
    function check() {
      const req = http.get(HEALTH_URL, { timeout: 800 }, (res) => {
        if (res.statusCode === 200) resolve(true); else retry();
      });
      req.on('error', retry);
      req.setTimeout(800, () => { req.destroy(); retry(); });
    }
    function retry() {
      if (Date.now() - start > maxMs) { resolve(false); return; }
      setTimeout(check, 400);
    }
    check();
  });
}

async function startEmbeddedBackend() {
  const portReady = await isBackendRunning();
  if (portReady) {
    console.log('Backend already running on port', BACKEND_PORT);
    return true;
  }

  const backendDir = getBackendDir();
  const serverPath = path.join(backendDir, 'dist', 'server.js');

  if (!fs.existsSync(serverPath)) {
    console.error('Backend server not found:', serverPath);
    return false;
  }

  console.log('Starting embedded backend from:', serverPath);

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(BACKEND_PORT),
    DATABASE_URL: `file:${path.join(app.getPath('userData'), 'planner.db')}`,
    JWT_SECRET: 'embedded-local-jwt-secret-change-me-32-chars',
  };

  backendProcess = spawn(isDev ? 'node' : process.execPath, [serverPath], {
    cwd: backendDir,
    env,
    stdio: 'pipe',
  });

  backendProcess.stdout?.on('data', (d) => console.log('[backend]', d.toString().trim()));
  backendProcess.stderr?.on('data', (d) => console.error('[backend]', d.toString().trim()));

  backendProcess.on('error', (err) => console.error('Backend error:', err));
  backendProcess.on('exit', (code) => {
    console.log('Backend exited with code:', code);
    backendProcess = null;
  });

  return await waitForBackend(30000);
}

function stopBackend() {
  if (!backendProcess) return;
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', String(backendProcess.pid), '/T', '/F'], {
        shell: true, detached: true, windowsHide: true,
      });
    } catch {
      try { backendProcess.kill(); } catch {}
    }
  } else {
    backendProcess.kill('SIGTERM');
  }
  backendProcess = null;
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: { contextIsolation: true },
    show: false,
  });

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin:0; display:flex; align-items:center; justify-content:center;
               height:100vh; background:#ffffff; font-family:system-ui,sans-serif; }
        .box { text-align:center; }
        .spinner { width:40px; height:40px; border:3px solid #e5e7eb;
                    border-top-color:#4f46e5; border-radius:50%;
                    animation:spin 1s linear infinite; margin:0 auto 16px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        h2 { margin:0 0 8px; font-size:18px; color:#111827; }
        p { margin:0; font-size:13px; color:#6b7280; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="spinner"></div>
        <h2>Планер</h2>
        <p>Запуск сервера...</p>
      </div>
    </body>
    </html>
  `)}`);

  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'Планер',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, '..', 'public', 'favicon.svg'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    mainWindow.show();
    if (splashWindow) { splashWindow.close(); splashWindow = null; }
  } else {
    mainWindow.loadURL(`http://localhost:${BACKEND_PORT}`);
    mainWindow.once('ready-to-show', () => {
      if (splashWindow) { splashWindow.close(); splashWindow = null; }
      mainWindow.show();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    stopBackend();
  });
}

app.whenReady().then(async () => {
  // In production, start embedded backend first with splash screen
  if (!isDev) {
    createSplashWindow();
    const ready = await startEmbeddedBackend();
    if (!ready) {
      if (splashWindow) { splashWindow.close(); splashWindow = null; }
      await dialog.showErrorBox(
        'Ошибка запуска',
        'Не удалось запустить встроенный сервер. Попробуйте перезапустить приложение.'
      );
      app.quit();
      return;
    }
  }

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => stopBackend());
