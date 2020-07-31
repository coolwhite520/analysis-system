import { ipcMain, dialog, app, BrowserWindow, shell } from "electron";

export default function() {
  // 通过主进称中转消息到calculate渲染进程
  ipcMain.on("read-example-file", (e, args) => {
    global.miniWindow.webContents.send("read-example-file", args);
  });

  ipcMain.on("read-example-file-over", (e, args) => {
    global.mainWindow.webContents.send("read-example-file-over", args);
  });
  // 发送读取开始的消息到mini窗口
  ipcMain.on("read-all-file", (e, args) => {
    global.miniWindow.webContents.send("read-all-file", args);
  });
  // mini窗口发送开始
  ipcMain.on("read-one-file-begin", (e, args) => {
    global.mainWindow.webContents.send("read-one-file-begin", args);
  });
  // mini窗口发送进度条数据
  ipcMain.on("read-one-file-proccess", (e, args) => {
    global.mainWindow.webContents.send("read-one-file-proccess", args);
  });
  // mini窗口发送开始
  ipcMain.on("read-one-file-over", (e, args) => {
    global.mainWindow.webContents.send("read-one-file-over", args);
  });
  // mini窗口发送读取完成的消息
  ipcMain.on("read-all-file-over", (e, args) => {
    global.mainWindow.webContents.send("read-all-file-over", args);
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
