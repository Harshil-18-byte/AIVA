import { app, BrowserWindow } from "electron";

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 360,
    height: 500,
    alwaysOnTop: true,
    frame: false,
    transparent: true
  });

  win.loadURL("http://localhost:5173");
});
