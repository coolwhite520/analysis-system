import { ipcMain, dialog, app, BrowserWindow, shell } from "electron";
import createDataImportWindow from "./window/dataCollectionWindow";
const log = require("electron-log");
export default function() {
  // 通过主进称中转消息到calculate渲染进程
  // 发送读取所有文件示例的消息到mini窗口
  ipcMain.on("parse-all-example-file", (e, args) => {
    global.dataCollectionWindow.webContents.send(
      "parse-all-example-file",
      args
    );
  });
  // mini窗口发送一条解析sheet数据到mainWnd
  ipcMain.on("parse-one-example-sheet-over", (e, args) => {
    global.mainWindow.webContents.send("parse-one-example-sheet-over", args);
  });
  // mini窗口通知mainWnd所有的解析玩不
  ipcMain.on("parse-all-example-file-over", (e, args) => {
    global.mainWindow.webContents.send("parse-all-example-file-over", args);
  });
  // 发送读取开始的消息到mini窗口
  ipcMain.on("read-all-file", (e, args) => {
    global.dataCollectionWindow.webContents.send("read-all-file", args);
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

  // main窗口发送导入请求
  ipcMain.on("import-one-table-begin", (e, args) => {
    global.dataCollectionWindow.webContents.send(
      "import-one-table-begin",
      args
    );
  });
  ipcMain.on("import-one-table-process", (e, args) => {
    global.mainWindow.webContents.send("import-one-table-process", args);
  });
  ipcMain.on("import-one-table-complete", (e, args) => {
    global.mainWindow.webContents.send("import-one-table-complete", args);
  });
  // 给export窗口发送开始
  ipcMain.on("export-one-file-begin", (e, args) => {
    global.exportWindow.webContents.send("export-one-file-begin", args);
  });
  // export窗口发送进度条数据
  ipcMain.on("export-one-file-proccess", (e, args) => {
    global.mainWindow.webContents.send("export-one-file-proccess", args);
  });
  //export窗口发送开始
  ipcMain.on("export-one-file-over", (e, args) => {
    global.mainWindow.webContents.send("export-one-file-over", args);
  });
  // 隐藏db设置
  ipcMain.on("hide-db-config", () => {
    global.dbConfigWindow.hide();
  });
  ipcMain.on("show-db-config", () => {
    global.dbConfigWindow.show();
  });

  // 数据库初始化操作窗口
  ipcMain.on("hide-db-init", () => {
    global.dbInitWindow.hide();
  });
  ipcMain.on("show-db-init", () => {
    global.dbInitWindow.show();
  });

  //
  // 打开数据采集窗口
  ipcMain.on("data-collection-open", () => {
    if (global.dataCollectionWindow) {
      global.dataCollectionWindow.close();
      global.dataCollectionWindow = null;
    }
    global.dataCollectionWindow = createDataImportWindow(BrowserWindow);
    if (process.env.NODE_ENV === "development")
      global.dataCollectionWindow.show();
  });
  ipcMain.on("data-collection-open-complete", () => {
    global.mainWindow.webContents.send("data-collection-open-complete");
  });
  ipcMain.on("data-collection-close", () => {
    if (global.dataCollectionWindow) {
      global.dataCollectionWindow.close();
      global.dataCollectionWindow = null;
    }
  });

  ipcMain.on("reloadApp", () => {
    global.mainWindow.webContents.send("reloadApp");
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
      wins[i].close();
    }
    app.exit(0);
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
