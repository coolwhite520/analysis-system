// 进行cpu运算的窗口
import csvReader from "./modules/reader/csvReader";
import { ipcRenderer } from "electron";

const createCalculateWindow = function(BrowserWindow) {
  let obj = {
    height: 1,
    width: 1,
    minWidth: 320,
    show: false,
    frame: false,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: process.env.NODE_ENV === "development",
    transparent: process.platform !== "linux",
    // alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      webSecurity: false,
    },
  };

  let miniWindow = new BrowserWindow(obj);

  miniWindow.loadFile("./calculate.html");

  miniWindow.on("closed", () => {
    miniWindow = null;
  });

  ipcRenderer.on("read-csv-file", async (e, args) => {
    let records = await csvReader.parseFileSync(args);
    miniWindow.webContents.send("read-csv-file-over", records);
  });
  return miniWindow;
};
export default createCalculateWindow;
