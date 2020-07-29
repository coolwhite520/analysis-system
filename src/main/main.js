import { app, BrowserWindow, screen } from "electron";
import initIpcEvent from "./modules/ipcEvents";
import createMiniWindow from "./modules/window/miniWindow";

const isDevelopment = process.env.NODE_ENV !== "production";
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

global.softVersion = "1.0.0.1";

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#/`
    : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  global.height = parseInt(screen.getPrimaryDisplay().workAreaSize.height);

  mainWindow = new BrowserWindow({
    useContentSize: true,
    title: require("../../package.json").description,
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

  mainWindow.loadURL(winURL);
  mainWindow.maximize();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.setResizable(false);
    global.mainWindow = mainWindow;
    global.miniWindow = createMiniWindow(BrowserWindow);
    // if (isDevelopment) {
    //   // 安装vue-devtools
    //   let extensions = BrowserWindow.getDevToolsExtensions();
    //   if (!extensions["Vue.js devtools"]) {
    //     BrowserWindow.addDevToolsExtension(
    //       path.resolve(__dirname, "./../../src/main/vue-devtools")
    //     );
    //   }
    //   // 打开调试窗口
    //   // mainWindow.webContents.openDevTools()
    // }
    // mainWindow.webContents.openDevTools();
    // 初始化进程之间事件监听
    initIpcEvent();
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
