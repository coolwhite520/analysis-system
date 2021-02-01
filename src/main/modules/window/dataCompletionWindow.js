// 资金穿透模型的工作进程 常驻进程

import { LOAD_URL } from "../../config";
const miniWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#dataCompletion`
    : `${LOAD_URL}#dataCompletion`;

const createDataCompletionWindow = function(BrowserWindow) {
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

  let dataCompletionWnd = new BrowserWindow(obj);

  dataCompletionWnd.loadURL(miniWinURL);

  dataCompletionWnd.on("closed", () => {
    dataCompletionWnd = null;
  });
  dataCompletionWnd.once("ready-to-show", () => {
    // zjctWorkerWnd.showInactive();
    // zjctWorkerWnd.hide();
  });

  return dataCompletionWnd;
};
export default createDataCompletionWindow;
