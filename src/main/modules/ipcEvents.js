import { ipcMain, dialog, app, BrowserWindow, shell } from "electron";
import createDataImportWindow from "./window/dataCollectionWindow";
import createZjctWorkerWindow from "./window/zjctWorkerWindow";
import createDataCompletionWindow from "./window/dataCompletionWindow";
import createMainWindow from "./window/mainWindow";

import { Pool } from "pg";
const log = require("electron-log");
export default function() {
  ipcMain.on("set-global-pool-config", (e, args) => {
    let { dbCon } = args;
    global.dbCon = dbCon;
    e.returnValue = "set-global-pool-config success";
  });
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

  // 给cjctView窗口发送消息
  ipcMain.on("calculate-link-begin", (e, args) => {
    global.zjctWorkerWnd.webContents.send("calculate-link-begin", args);
  });
  ipcMain.on("calculate-link-end", (e, args) => {
    global.mainWindow.webContents.send("calculate-link-end", args);
  });

  // 给dataCompletionWnd窗口发送消息
  ipcMain.on("data-completion-begin", (e, args) => {
    global.dataCompletionWnd.webContents.send("data-completion-begin", args);
  });
  ipcMain.on("data-completion-end", (e, args) => {
    global.mainWindow.webContents.send("data-completion-end", args);
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
  // 打开zjct分析进程
  ipcMain.on("calculate-link-open", () => {
    if (global.zjctWorkerWnd) {
      global.zjctWorkerWnd.close();
      global.zjctWorkerWnd = null;
    }
    global.zjctWorkerWnd = createZjctWorkerWindow(BrowserWindow);
    if (process.env.NODE_ENV === "development") global.zjctWorkerWnd.show();
  });
  ipcMain.on("calculate-link-ready", () => {
    global.mainWindow.webContents.send("calculate-link-ready");
  });
  ipcMain.on("calculate-link-close", () => {
    if (global.zjctWorkerWnd) {
      global.zjctWorkerWnd.close();
      global.zjctWorkerWnd = null;
    }
  });

  // 打开DataCompletion分析进程,数据补全
  ipcMain.on("data-completion-open", () => {
    if (global.dataCompletionWnd) {
      global.dataCompletionWnd.close();
      global.dataCompletionWnd = null;
    }
    global.dataCompletionWnd = createDataCompletionWindow(BrowserWindow);
    if (process.env.NODE_ENV === "development") global.dataCompletionWnd.show();
  });
  ipcMain.on("data-completion-ready", () => {
    global.mainWindow.webContents.send("data-completion-ready");
  });
  ipcMain.on("data-completion-close", () => {
    if (global.dataCompletionWnd) {
      global.dataCompletionWnd.close();
      global.dataCompletionWnd = null;
    }
  });

  ipcMain.on("reloadApp", (e, args) => {
    global.mainWindow.webContents.send("reloadApp", args);
  });
  ipcMain.on("move-to-zero", () => {
    let bounds = global.mainWindow.getBounds();
    bounds.x = 0;
    bounds.y = 0;
    global.mainWindow.setBounds(bounds);
  });


  ipcMain.on("show-main-window", () => {
    if (global.licenseWnd) {
      global.licenseWnd.hide();
      global.licenseWnd = null;
    }
    global.mainWindow = createMainWindow()
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
