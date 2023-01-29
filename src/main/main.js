import {
  app,
  protocol,
  BrowserWindow,
  screen,
  session,
} from "electron";

app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");

import initIpcEvent from "./modules/ipcEvents";
import createLicenseWindow from "./modules/window/licenseWindow";
import createMainWindow from "./modules/window/mainWindow";

import fs from "fs";
import path from "path";
import { ACHEME } from "./config";
import log from "electron-log";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const { URL } = require("url");

protocol.registerSchemesAsPrivileged([
  { scheme: ACHEME, privileges: { secure: true, standard: true } },
]);


function initEnvParams() {
  if (process.env.NODE_ENV !== "development") {
    global.__static = require("path")
      .join(__dirname, "/static")
      .replace(/\\/g, "\\\\");
  }

  global.softVersion = require("../../package.json").version;
  global.levelPrefix = "RestoreDataCollection.";
  global.title = require("../../package.json").description;
  let appName = require("../../package.json").name;

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
  global.windowSize = screen.getPrimaryDisplay().workAreaSize;
  global.widthDivHeight = global.windowSize.width / global.windowSize.height;
}


app.on("activate", () => {
  // global.mainWindow.show();
  if (process.platform === "win32") {
    global.licenseWnd.show();
  } else {
    global.mainWindow.show();
  }

});

app.on("ready", () => {
  initEnvParams()
  initIpcEvent()
  if (process.platform === "win32") {
    global.height = 500;
    global.licenseWnd = createLicenseWindow(BrowserWindow);

  } else {
    global.mainWindow = createMainWindow(BrowserWindow);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// app.on("activate", () => {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });
