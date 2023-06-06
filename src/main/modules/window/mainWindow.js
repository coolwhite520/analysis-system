import {
    app,
    BrowserWindow,
    Menu,
    ipcMain, screen,
} from "electron";
app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");

const isOnline = require("is-online");
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import createExportWindow from "./exportWindow";
import fs from "fs";
import path from "path";
import { ACHEME, LOAD_URL } from "../../config";
import log from "electron-log";
const uuid = require("uuid");

// require("./innerSocket");
// const renderProcessApi = path.join(__dirname, './inject.js')
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

let mainWindow;

const winURL =
    process.env.NODE_ENV === "development"
        ? `http://localhost:9080/#analysisView`
        : `${LOAD_URL}#analysisView`;

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

function createMainWindow() {
    global.height = parseInt(screen.getPrimaryDisplay().workAreaSize.height);
    mainWindow = new BrowserWindow({
        // backgroundColor: "#11151d",
        useContentSize: true,
        title: global.title,
        resizable: process.platform === "darwin",
        movable: process.platform === "darwin",
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

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.setResizable(false);
        global.mainWindow = mainWindow;
    });
    mainWindow.once("show", () => {
        // initIpcEvent();
        global.exportWindow = createExportWindow(BrowserWindow);
    });

    handleUpdate();

    ipcMain.on("checkForUpdate", async (event, data) => {
        //和之前package.json配置的一样
        if (!(await isOnline())) {
            sendUpdateMessage(returnData.errorNoInternet);
            return;
        }
        let publishList = require("../../../../package.json").publish;
        autoUpdater.setFeedURL(publishList[0].url);
        autoUpdater.checkForUpdates();
    });

    return mainWindow;
}

export default createMainWindow;

