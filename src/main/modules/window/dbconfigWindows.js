import { ipcRenderer } from "electron";

const dbConfigWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#dbconfig`
    : `file://${__dirname}/#dbconfig`;

const createDbConfigWindow = function(BrowserWindow) {
  let obj = {
    height: 360,
    width: 500,
    minWidth: 0,
    show: false,
    frame: false,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: false,
    // transparent: process.platform !== "linux",
    parent: global.mainWindow,
    // modal: true,
    alwaysOnTop: true,
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
