// 资金穿透模型的工作进程 常驻进程

import { ipcRenderer } from "electron";
import { LOAD_URL } from "../../config";
const miniWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#zjct`
    : `${LOAD_URL}#zjct`;

const createZjctWorkerWindow = function(BrowserWindow) {
  let obj = {
    height: 100,
    width: 100,
    minWidth: 0,
    show: process.env.NODE_ENV === "development" ? true : false,
    frame: true,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: true,
    // transparent: process.platform !== "linux",
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      webSecurity: false,
    },
  };

  let zjctWorkerWnd = new BrowserWindow(obj);

  zjctWorkerWnd.loadURL(miniWinURL);

  zjctWorkerWnd.on("closed", () => {
    zjctWorkerWnd = null;
  });
  zjctWorkerWnd.once("ready-to-show", () => {
    // zjctWorkerWnd.showInactive();
    // zjctWorkerWnd.hide();
  });

  return zjctWorkerWnd;
};
export default createZjctWorkerWindow;
