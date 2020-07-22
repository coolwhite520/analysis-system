import { ipcMain, dialog, app, BrowserWindow, shell } from "electron";

export default function() {
  // 通过主进称中转消息到calculate渲染进程
  ipcMain.on("read-csv-file", (e, args) => {
    global.mainWindow.webContents.send("read-csv-file", args);
  });

  ipcMain.on("read-csv-file-over", (e, args) => {
    global.mainWindow.webContents.send("read-csv-file-over", args);
  });

  ipcMain.on("move-to-zero", () => {
    let bounds = global.mainWindow.getBounds();
    bounds.x = 0;
    bounds.y = 0;
    global.mainWindow.setBounds(bounds);
  });

  ipcMain.on("show-window", () => {
    global.mainWindow.show();
  });

  ipcMain.on("window-min", () => {
    global.mainWindow.minimize();
    let bounds = global.mainWindow.getBounds();
    bounds.x = 0;
    bounds.y = 0;
    global.mainWindow.setBounds(bounds);
  });

  ipcMain.on("window-close", () => {
    let wins = BrowserWindow.getAllWindows();
    for (let i = 0; i < wins.length; i++) {
      wins[i].hide();
    }
  });

  ipcMain.on("app-exit", () => {
    // 所有窗口都将立即被关闭，而不询问用户，而且 before-quit 和 will-quit 事件也不会被触发。
    app.exit();
  });

  ipcMain.on("restart", () => {
    app.relaunch();
    app.exit(0);
  });
}
