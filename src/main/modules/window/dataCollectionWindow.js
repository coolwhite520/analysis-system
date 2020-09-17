import { ipcRenderer } from "electron";
import { LOAD_URL } from "../../config";
const log = require("electron-log");
const dataCollectionWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#dataCollection`
    : `${LOAD_URL}#dataCollection`;

const createDataImportWindow = function(BrowserWindow) {
  let obj = {
    height: 100,
    width: 100,
    minWidth: 0,
    show: false,
    frame: process.env.NODE_ENV === "development" ? true : false,
    fullscreenable: false,
    // skipTaskbar: true,
    resizable: true,
    // transparent: process.platform !== "linux",
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      webSecurity: false,
      enableRemoteModule: true,
    },
  };

  let miniWindow = new BrowserWindow(obj);

  miniWindow.loadURL(dataCollectionWinURL);

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
  miniWindow.once("ready-to-show", () => {
    log.info("hahahah");
    // miniWindow.showInactive();
    miniWindow.hide();
  });

  return miniWindow;
};
export default createDataImportWindow;
