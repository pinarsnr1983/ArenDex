const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "ArenDex",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Yerel dosya yükleme kısıtlamalarını kaldırır, beyaz ekranı önler
    }
  });

  // index.html dosyasını mutlak yolla yüklüyoruz
  const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
  win.loadURL(`file://${indexPath}`);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
