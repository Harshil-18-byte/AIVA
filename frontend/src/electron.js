const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    alwaysOnTop: false,
    frame: true,          // Standard OS window
    transparent: false,   // Solid background
    resizable: true,
    movable: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Allow loading local files
    }
  });

  win.loadURL("http://localhost:5173");
  
  // IPC for window controls if needed
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
