import {
  app,
  protocol,
  BrowserWindow,
  screen,
  Menu,
  MenuItem,
  globalShortcut,
  ipcMain,
  session,
} from "electron";
app.commandLine.appendSwitch("disable-web-security");
const isOnline = require("is-online");
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import initIpcEvent from "./modules/ipcEvents";
import createExportWindow from "./modules/window/exportWindow";
import fs from "fs";
import path from "path";
import { ACHEME, LOAD_URL } from "./config";
import log from "electron-log";
const isDevelopment = process.env.NODE_ENV !== "production";
const uuid = require("uuid");
const { URL } = require("url");

// require("./innerSocket");
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
global.levelPrefix = "RestoreDataCollection.";
global.title = require("../../package.json").description;
let appName = require("../../package.json").name;

let mainWindow;

protocol.registerSchemesAsPrivileged([
  { scheme: ACHEME, privileges: { secure: true, standard: true } },
]);

const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#/`
    : `${LOAD_URL}`;

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
  mainWindow.webContents.send("message", text);
}

let returnData = {
  error: { status: -1, msg: "检测更新查询异常。", logPath: "" },
  errorNoInternet: {
    status: -2,
    msg: "当前未接入网络，请检查是否联网。",
    logPath: "",
  },
  checking: { status: 0, msg: "正在检查应用程序更新。" },
  updateAva: {
    status: 1,
    msg: "检测到新版本，正在下载,请稍后。",
    version: "",
  },
  updateNotAva: {
    status: 2,
    msg: `您现在使用的版本${global.softVersion}为最新版本,无需更新!`,
  },
};

//处理更新操作
function handleUpdate() {
  //更新错误
  autoUpdater.on("error", (error) => {
    //  error;
    let tempPath = app.getPath("temp");
    let logErrPath = path.join(tempPath, uuid.v1() + ".txt");
    fs.writeFileSync(logErrPath, error);
    returnData.error.logPath = logErrPath;
    sendUpdateMessage(returnData.error);
  });

  //检查中
  autoUpdater.on("checking-for-update", () => {
    sendUpdateMessage(returnData.checking);
  });

  //发现新版本
  autoUpdater.on("update-available", (info) => {
    returnData.updateAva.version = info.version;
    sendUpdateMessage(returnData.updateAva);
  });

  //当前版本为最新版本
  autoUpdater.on("update-not-available", (info) => {
    log.info(info);
    setTimeout(function() {
      sendUpdateMessage(returnData.updateNotAva);
    }, 1000);
  });

  // 更新下载进度事件
  autoUpdater.on("download-progress", (progressObj) => {
    mainWindow.webContents.send("downloadProgress", progressObj);
  });

  autoUpdater.on(
    "update-downloaded",
    (
      event,
      releaseNotes,
      releaseName,
      releaseDate,
      updateUrl,
      quitAndUpdate
    ) => {
      ipcMain.on("isUpdateNow", (e, arg) => {
        autoUpdater.quitAndInstall();
      });
      mainWindow.webContents.send("isUpdateNow", {
        releaseNotes,
        releaseName,
        releaseDate,
        updateUrl,
      });
    }
  );
}

function createWindow() {
  /**
   * Initial window options
   */
  const xxx_filter = {
    urls: ["http://www.guabu.com/*"],
  };
  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  session.defaultSession.webRequest.onBeforeSendHeaders(
    xxx_filter,
    (details, callback) => {
      const myURL = new URL(details.url);
      details.requestHeaders["Referer"] = myURL.origin;
      details.requestHeaders["User-Agent"] = userAgent;
      callback({ requestHeaders: details.requestHeaders });
    }
  );
  global.height = parseInt(screen.getPrimaryDisplay().workAreaSize.height);

  app.setName(appName);
  app.setPath(
    "userData",
    app.getPath("userData").replace(/Electron/i, appName)
  );
  let userDataPath = app.getPath("userData"); // 防止覆盖安装的时候丢失数据
  global.userDataPath = userDataPath;

  // 初始化config路径
  let configPath = require("path").join(userDataPath, "config");
  log.info(configPath);
  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true });
  }
  global.configPath = configPath;
  // 初始化db路径
  let resoreDbPath = require("path").join(userDataPath, "db");
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

  handleUpdate();

  ipcMain.on("checkForUpdate", async (event, data) => {
    //和之前package.json配置的一样
    if (!(await isOnline())) {
      sendUpdateMessage(returnData.errorNoInternet);
      return;
    }
    let publishList = require("../../package.json").publish;
    autoUpdater.setFeedURL(publishList[0].url);
    autoUpdater.checkForUpdates();
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
