const path = require("path");
const fs = require("fs");
const shell = require("shelljs");

async function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done");
    }, ms);
  });
}
exports.default = async function(context) {
  console.log(context);
  let exeFilePath;
  switch (process.platform) {
    case "win32":
      exeFilePath = path.join(context.appOutDir, "analysis-system.exe");
      break;
    case "darwin":
      exeFilePath = path.join(context.appOutDir, "analysis-system.app");
      break;
    case "linux":
      exeFilePath = path.join(context.appOutDir, "analysis-system");
      break;
  }
  if (process.platform === "win32" && fs.existsSync(exeFilePath)) {
    let newPathFileName = path.join(
      context.appOutDir,
      "analysis-system.origin.exe"
    );
    fs.renameSync(exeFilePath, newPathFileName);
    shell.exec("./protect.bat", { silent: false });
    await sleep(1000);
    fs.unlinkSync(newPathFileName);
  }
};
