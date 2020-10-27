import { app, protocol, BrowserWindow, screen, Menu, MenuItem } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import initIpcEvent from "./modules/ipcEvents";
import createDbInitWindow from "./modules/window/initDbWindow";
import createExportWindow from "./modules/window/exportWindow";
import createDbConfigWindow from "./modules/window/dbconfigWindows";
import fs from "fs";
import path from "path";
import { ACHEME, LOAD_URL } from "./config";
import log from "electron-log";
const isDevelopment = process.env.NODE_ENV !== "production";
// const renderProcessApi = path.join(__dirname, './inject.js')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

global.softVersion = require("../../package.json").version;

let mainWindow;

protocol.registerSchemesAsPrivileged([
  { scheme: ACHEME, privileges: { secure: true, standard: true } },
]);

const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#/`
    : `${LOAD_URL}`;

function createWindow() {
  /**
   * Initial window options
   */
  global.levelPrefix = "RestoreDataCollection.";
  global.title = require("../../package.json").description;
  global.height = parseInt(screen.getPrimaryDisplay().workAreaSize.height);
  // let exePath = path.dirname(app.getPath("exe"));
  let appName = require("../../package.json").name;
  app.setName(appName);
  app.setPath(
    "userData",
    app.getPath("userData").replace(/Electron/i, appName)
  );
  let exePath = app.getPath("userData"); // 防止覆盖安装的时候丢失数据
  global.appPath = exePath;
  global.configPath = require("path").join(appPath, "config");
  log.info(global.configPath);
  if (!fs.existsSync(global.configPath)) {
    fs.mkdirSync(global.configPath, { recursive: true });
  }
  global.resoreDbPath = require("path").join(appPath, "db");
  log.info(global.resoreDbPath);
  if (!fs.existsSync(global.resoreDbPath)) {
    fs.mkdirSync(global.resoreDbPath, { recursive: true });
  }

  mainWindow = new BrowserWindow({
    // backgroundColor: "#11151d",
    useContentSize: true,
    title: global.title,
    resizable: process.platform === "darwin" ? true : false,
    movable: process.platform === "darwin" ? true : false,
    show: false,
    frame: false,
    // backgroundColor: "#2e2c29", // 初始化一个背景色
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,
    },
  });
  // 必须调用创建scheme的协议函数，否则打包后通过路由的子页面会显示空白。
  createProtocol(ACHEME);
  mainWindow.loadURL(winURL);
  mainWindow.maximize();
  var template = [
    {
      label: "首页",
      submenu: [
        {
          label: "save",
          accelerator: `CmdOrCtrl+s`,
          click: () => {
            // screenShot.makePngWindowShot(global.appPath);
            global.mainWindow.webContents.send("save-state", {});
          },
        },
        {
          label: "i",
          accelerator: `CmdOrCtrl+i`,
          click: () => {
            // screenShot.makePngWindowShot(global.appPath);
            global.mainWindow.webContents.openDevTools();
          },
        },
      ],
    },
  ];
  var m = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(m);
  global.vendorPath = process.mainModule.filename.includes("app.asar")
    ? path.join(
        process.mainModule.filename,
        `../../../vendor/${process.platform}`
      )
    : path.join(
        process.mainModule.filename.replace(
          "node_modules/electron-mocha/lib/main.js",
          "index.html"
        ),
        `../vendor/${process.platform}`
      );
  log.info(global.vendorPath);
  global.windowSize = screen.getPrimaryDisplay().workAreaSize;
  global.widthDivHeight = global.windowSize.width / global.windowSize.height;
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.setResizable(false);
    global.mainWindow = mainWindow;
  });
  mainWindow.once("show", () => {
    initIpcEvent();
    global.exportWindow = createExportWindow(BrowserWindow);
    global.dbConfigWindow = createDbConfigWindow(BrowserWindow);
  });
}
app.on("activate", () => {
  // let wins = BrowserWindow.getAllWindows();
  // for (let i = 0; i < wins.length; i++) {
  //   wins[i].show();
  // }
  global.mainWindow.show();
});
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
