import { ipcRenderer } from "electron";
import { LOAD_URL } from "../../config";
const miniWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#export`
    : `${LOAD_URL}#export`;

const createMiniWindow = function(BrowserWindow) {
  let obj = {
    height: 100,
    width: 100,
    minWidth: 0,
    show: process.env.NODE_ENV === "development",
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

  let miniWindow = new BrowserWindow(obj);

  miniWindow.loadURL(miniWinURL);

  miniWindow.on("closed", () => {
    miniWindow = null;
  });
  miniWindow.once("ready-to-show", () => {
    // miniWindow.showInactive();
    // miniWindow.hide();
  });

  return miniWindow;
};
export default createMiniWindow;
