import {
  app,
  protocol,
  BrowserWindow,
  screen,
  Menu,
  MenuItem,
  globalShortcut,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import initIpcEvent from "./modules/ipcEvents";
import createExportWindow from "./modules/window/exportWindow";
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
  let appName = require("../../package.json").name;
  app.setName(appName);
  app.setPath(
    "userData",
    app.getPath("userData").replace(/Electron/i, appName)
  );
  let appPath = app.getPath("userData"); // 防止覆盖安装的时候丢失数据
  global.appPath = appPath;

  // 初始化config路径
  let configPath = require("path").join(appPath, "config");
  log.info(configPath);
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }
  global.configPath = configPath;
  // 初始化db路径
  let resoreDbPath = require("path").join(appPath, "db");
  log.info(resoreDbPath);
  if (!fs.existsSync(resoreDbPath)) {
    fs.mkdirSync(resoreDbPath, { recursive: true });
  }
  global.resoreDbPath = resoreDbPath;
  global.vendorPath =
    process.platform === "win32"
      ? path.join(path.dirname(app.getPath("exe")), `vendor`)
      : path.join(path.dirname(app.getPath("exe")), `../vendor`);

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
            global.mainWindow.webContents.send("save-state", {});
          },
        },
        {
          label: "i",
          accelerator: `CmdOrCtrl+i`,
          click: () => {
            global.mainWindow.webContents.openDevTools();
          },
        },
      ],
    },
  ];
  var m = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(m);
  // if (process.platform === "darwin") {
  //   let contents = mainWindow.webContents;
  //   globalShortcut.register("CommandOrControl+C", () => {
  //     contents.copy();
  //   });
  //   globalShortcut.register("CommandOrControl+V", () => {
  //     contents.paste();
  //   });
  // }
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
