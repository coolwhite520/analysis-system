import {ACHEME, LOAD_URL} from "../../config";
import {createProtocol} from "vue-cli-plugin-electron-builder/lib";
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
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true,
    },
  };

  let licenseWindow = new BrowserWindow(obj);
  // 必须调用创建scheme的协议函数，否则打包后通过路由的子页面会显示空白。
  createProtocol(ACHEME);

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
