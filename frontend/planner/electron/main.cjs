const path = require('path');
const fs = require('fs');
const http = require('http');
const { spawn } = require('child_process');

// ===== Guard: if we were spawned as a Node backend, run server directly =====
if (process.env.ELECTRON_RUN_AS_NODE === '1') {
  const serverPath = process.argv.find((a) => typeof a === 'string' && a.endsWith('server.js'));
  if (serverPath) {
    import(serverPath).catch((err) => {
      console.error('Failed to load backend server:', err);
      process.exit(1);
    });
    return;
  }
}

// ===== Electron imports =====================================================
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

// ===== Single instance lock =================================================
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  console.log('Another instance is already running. Exiting.');
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 3001;
const HEALTH_URL = `http://localhost:${BACKEND_PORT}/health`;

// Config file for cloud URL
const configPath = path.join(app.getPath('userData'), 'planner-config.json');
function readConfig() {
  try {
    if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {}
  return {};
}
function writeConfig(config) {
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error('Failed to write config:', err);
  }
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

async function runDbMigrate(backendDir, env) {
  const prismaBin = path.join(backendDir, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
  if (!fs.existsSync(prismaBin)) {
    console.warn('Prisma CLI not found, skipping migration. DB may fail if not initialized.');
    return false;
  }
  return new Promise((resolve) => {
    console.log('Running prisma migrate deploy...');
    const proc = spawn(prismaBin, ['migrate', 'deploy'], {
      cwd: backendDir,
      env,
      stdio: 'pipe',
      shell: process.platform === 'win32',
      windowsHide: true,
    });
    let stderr = '';
    proc.stdout?.on('data', (d) => console.log('[prisma]', d.toString().trim()));
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (err) => {
      console.error('Migration spawn error:', err);
      resolve(false);
    });
    proc.on('close', (code) => {
      console.log('Migration exited with code:', code);
      if (code !== 0) console.error('Migration stderr:', stderr);
      resolve(code === 0);
    });
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

  // Ensure userData dir exists (for DB and config)
  const userData = app.getPath('userData');
  fs.mkdirSync(userData, { recursive: true });

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(BACKEND_PORT),
    DATABASE_URL: `file:${path.join(userData, 'planner.db')}`,
    JWT_SECRET: 'embedded-local-jwt-secret-change-me-32-chars-long-enough',
    ELECTRON_RUN_AS_NODE: '1',
  };

  // Always migrate DB before starting backend.
  // Prisma creates an empty SQLite file on first connect,
  // so checking file existence is unreliable — tables may still be missing.
  let migrated = await runDbMigrate(backendDir, env);

  // If migration failed because an old DB exists with incompatible schema,
  // delete it and retry once.
  if (!migrated) {
    const dbPath = path.join(userData, 'planner.db');
    if (fs.existsSync(dbPath)) {
      console.log('Migration failed. Removing old DB and retrying...');
      try {
        fs.unlinkSync(dbPath);
      } catch (err) {
        console.error('Failed to delete old DB:', err);
      }
      migrated = await runDbMigrate(backendDir, env);
    }
  }

  if (!migrated) {
    console.error('DB migration failed. Cannot start backend.');
    return false;
  }

  console.log('Starting embedded backend from:', serverPath);

  backendProcess = spawn(isDev ? 'node' : process.execPath, [serverPath], {
    cwd: backendDir,
    env,
    stdio: 'pipe',
    windowsHide: true,
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
      // ignore
    }
    try {
      backendProcess.kill('SIGTERM');
    } catch {
      try { backendProcess.kill('SIGKILL'); } catch {}
    }
  } else {
    try {
      backendProcess.kill('SIGTERM');
    } catch {
      try { backendProcess.kill('SIGKILL'); } catch {}
    }
  }
  backendProcess = null;
}

function createSplashWindow() {
  console.log('Creating splash window...');
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
  console.log('Creating main window...');
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
      dialog.showErrorBox(
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
