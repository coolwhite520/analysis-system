import { LOAD_URL } from "../../config";
const miniWinURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080/#license`
    : `${LOAD_URL}#license`;

const createLicenseWindow = function(BrowserWindow) {
  let obj = {
    height: 500,
    width: 800,
    minWidth: 0,
    show: true,
    frame: false,
    useContentSize: true,
    titleBarStyle: 'hidden',
    fullscreenable: false,
    skipTaskbar: false,
    resizable: process.env.NODE_ENV === "development",
    // transparent: process.platform !== "linux",
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: false,
      webSecurity: false,
    },

  };

  let licenseWindow = new BrowserWindow(obj);

  licenseWindow.loadURL(miniWinURL);

  licenseWindow.on("closed", () => {
    licenseWindow = null;
  });
  licenseWindow.once("ready-to-show", () => {
    // miniWindow.showInactive();
    // miniWindow.hide();
  });

  return licenseWindow;
};
export default createLicenseWindow;
