// Программа «Планер» для Windows.
// Интерфейс открывается из собранных файлов (dist) по адресу app://planner,
// данные синхронизируются с облачным сервером (адрес встроен в сборку).

const path = require('path');
const fs = require('fs');
const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  globalShortcut,
  ipcMain,
  nativeImage,
  net,
  protocol,
  shell,
} = require('electron');

const APP_ID = 'ru.planner.desktop';
const SCHEME = 'app';
const HOST = 'planner';
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';
const distDir = path.join(__dirname, '..', 'dist');
const iconPath = path.join(__dirname, 'icon.png');

// Схема app:// ведёт себя как обычный защищённый сайт: работают localStorage, fetch, WebSocket.
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true },
  },
]);

// ----- Один экземпляр программы -----
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let tray = null;
let isQuitting = false;

app.setAppUserModelId(APP_ID); // нужно для уведомлений Windows

app.on('second-instance', () => showWindow());

// ----- Состояние окна -----
const statePath = () => path.join(app.getPath('userData'), 'window-state.json');

function readWindowState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), 'utf8'));
  } catch {
    return { width: 1300, height: 860, maximized: false };
  }
}

function saveWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  try {
    const b = mainWindow.getNormalBounds();
    fs.writeFileSync(statePath(), JSON.stringify({ ...b, maximized: mainWindow.isMaximized() }));
  } catch {
    // ignore
  }
}

function isSafeExternal(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'mailto:';
  } catch {
    return false;
  }
}

// ----- Раздача файлов интерфейса по app://planner/... -----
function registerAppProtocol() {
  protocol.handle(SCHEME, (request) => {
    const { host, pathname } = new URL(request.url);
    if (host !== HOST) return new Response('Not found', { status: 404 });
    const rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
    const filePath = path.normalize(path.join(distDir, rel));
    // Не выпускаем запросы за пределы папки dist.
    if (!filePath.startsWith(distDir)) return new Response('Forbidden', { status: 403 });
    const target = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(distDir, 'index.html');
    return net.fetch(require('url').pathToFileURL(target).toString());
  });
}

function createWindow() {
  const state = readWindowState();
  mainWindow = new BrowserWindow({
    width: state.width || 1300,
    height: state.height || 860,
    x: state.x,
    y: state.y,
    minWidth: 380,
    minHeight: 560,
    title: 'Планер',
    icon: iconPath,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  });
  if (state.maximized) mainWindow.maximize();

  // Внешние ссылки — в браузере, а не внутри программы.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternal(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = url.startsWith(`${SCHEME}://${HOST}/`) || (isDev && url.startsWith('http://localhost:5173'));
    if (!allowed) {
      event.preventDefault();
      if (isSafeExternal(url)) shell.openExternal(url);
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadURL(`${SCHEME}://${HOST}/index.html`);
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());

  let saveTimer;
  for (const evt of ['resize', 'move']) {
    mainWindow.on(evt, () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveWindowState, 400);
    });
  }

  // Закрытие окна сворачивает программу в трей, чтобы приходили напоминания.
  let trayHintShown = false;
  mainWindow.on('close', (event) => {
    saveWindowState();
    if (isQuitting) return;
    event.preventDefault();
    mainWindow.hide();
    if (tray && !trayHintShown && process.platform === 'win32') {
      trayHintShown = true;
      tray.displayBalloon({
        iconType: 'info',
        title: 'Планер работает в фоне',
        content: 'Напоминания будут приходить. Открыть — двойной клик по значку у часов, выйти — правый клик → «Выход».',
      });
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function createTray() {
  let image = nativeImage.createFromPath(iconPath);
  if (!image.isEmpty()) image = image.resize({ width: 16, height: 16 });
  tray = new Tray(image);
  tray.setToolTip('Планер');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Открыть Планер', click: showWindow },
      {
        label: 'Запускать при входе в Windows',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (item) => app.setLoginItemSettings({ openAtLogin: item.checked, args: ['--hidden'] }),
      },
      { type: 'separator' },
      {
        label: 'Выход',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  tray.on('click', showWindow);
  tray.on('double-click', showWindow);
}

ipcMain.handle('open-external', (_event, url) => {
  if (typeof url === 'string' && isSafeExternal(url)) return shell.openExternal(url);
  return undefined;
});

app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();
  createTray();

  // При автозапуске с Windows окно не показываем — программа сразу в трее.
  if (process.argv.includes('--hidden') && mainWindow) {
    mainWindow.once('ready-to-show', () => mainWindow.hide());
  }

  globalShortcut.register('CommandOrControl+Shift+P', showWindow);
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Программа остаётся в трее.
});
