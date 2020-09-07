import { ipcRenderer, remote } from "electron";
import { LOAD_URL } from "../../config";
const dbConfigWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#dbconfig`
    : `${LOAD_URL}#dbconfig`;

const createDbConfigWindow = function(BrowserWindow) {
  let obj = {
    title: "数据库连接设置",
    height: 380,
    width: 480,
    minWidth: 0,
    show: false,
    frame: false,
    fullscreenable: false,
    // skipTaskbar: true,
    resizable: process.env.NODE_ENV === "production" ? false : true,
    // transparent: process.platform !== "linux",
    parent: global.mainWindow,
    modal: true,
    center: true,
    // alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      webSecurity: false,
    },
  };

  let dbconfigWindow = new BrowserWindow(obj);

  dbconfigWindow.loadURL(dbConfigWinURL);

  dbconfigWindow.on("closed", () => {
    dbconfigWindow = null;
  });

  return dbconfigWindow;
};
export default createDbConfigWindow;
