// ============================================================
// Electrocode — Electron main process (auto-généré)
// ============================================================
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, session } = require('electron');

app.commandLine.appendSwitch('disable-features', 'ServiceWorker');

let baseDir;
if (process.env.PORTABLE_EXECUTABLE_DIR) {
  baseDir = process.env.PORTABLE_EXECUTABLE_DIR;
} else if (process.env.PORTABLE_EXECUTABLE_FILE) {
  baseDir = path.dirname(process.env.PORTABLE_EXECUTABLE_FILE);
} else if (app.isPackaged) {
  baseDir = path.dirname(app.getPath('exe'));
} else {
  baseDir = __dirname;
}

const dataDir = path.join(baseDir, 'data');
try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}

app.setPath('userData', dataDir);
app.setPath('sessionData', dataDir);
app.setPath('cache', path.join(dataDir, 'cache'));
app.setPath('logs', path.join(dataDir, 'logs'));

function hardClean() {
  const folders = ['Service Worker', 'Cache', 'Code Cache', 'GPUCache',
                   'Cache Storage', 'Session Storage', 'blob_storage'];
  folders.forEach(name => {
    const p = path.join(dataDir, name);
    try { if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true }); } catch (e) {}
  });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 800, minWidth: 400, minHeight: 500,
    title: 'Electrocode',
    icon: path.join(__dirname, 'testcalcexe', 'icon.png'),
    autoHideMenuBar: true,
    backgroundColor: '#f1f5f9',
    webPreferences: { contextIsolation: true, nodeIntegration: false }
  });

  mainWindow.loadFile(path.join(__dirname, 'testcalcexe', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

function buildMenu() {
  const template = [
    { label: 'Fichier', submenu: [
      { role: 'reload', label: 'Recharger' },
      { type: 'separator' },
      { role: 'quit', label: 'Quitter' }
    ]},
    { label: 'Édition', submenu: [
      { role: 'undo', label: 'Annuler' },
      { role: 'redo', label: 'Rétablir' },
      { type: 'separator' },
      { role: 'cut', label: 'Couper' },
      { role: 'copy', label: 'Copier' },
      { role: 'paste', label: 'Coller' },
      { role: 'selectAll', label: 'Tout sélectionner' }
    ]},
    { label: 'Affichage', submenu: [
      { role: 'zoomIn', label: 'Zoom +' },
      { role: 'zoomOut', label: 'Zoom −' },
      { role: 'resetZoom', label: 'Zoom normal' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Plein écran' },
      { role: 'toggleDevTools', label: 'Outils de développement' }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(async () => {
  hardClean();
  try {
    await session.defaultSession.clearStorageData({
      storages: ['serviceworkers', 'cachestorage', 'cookies', 'shadercache']
    });
  } catch (e) {}
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});