const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const appName = require("../package.json").name;

async function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("done");
    }, ms);
  });
}
// 加密analysis-system.exe 和 asar文件
async function encrpyt(asarFilePath, exeFilePath) {
  console.log("encrypt app.asar.... begin");
  let encryptFilePath = path.join(__dirname, "encrypt.exe");
  let cmd = `${encryptFilePath} ${asarFilePath} ${exeFilePath}`;
  let batFileContent = `start /w ${cmd}`;
  console.log(batFileContent);
  let batFilepath = path.join(__dirname, "encrypt.bat");
  fs.writeFileSync(batFilepath, batFileContent);
  shell.exec(batFilepath, { silent: false, async: false });
  fs.unlinkSync(batFilepath);
  fs.unlinkSync(asarFilePath);
  fs.unlinkSync(exeFilePath);
  fs.renameSync(
    path.join(path.dirname(asarFilePath), "app.out.asar"),
    asarFilePath
  );
  fs.renameSync(
    path.join(path.dirname(exeFilePath), `${appName}.out.exe`),
    exeFilePath
  );

  console.log("encrypt app.asar....end");
}

async function vmProtect(exeFilePath) {
  // vmprotect保护
  console.log("protect begin....");
  let appOutDir = path.dirname(exeFilePath);
  let newPathFileName = path.join(appOutDir, `${appName}.origin.exe`);
  console.log("rename begin....");
  fs.renameSync(exeFilePath, newPathFileName);
  console.log("rename end....");
  let batFilePath = path.join(__dirname, "protect.bat");
  console.log(batFilePath);
  shell.exec(batFilePath, { silent: false, async: false });
  fs.unlinkSync(newPathFileName);
  fs.unlinkSync(newPathFileName + ".log");
  console.log("protect end....");
}

exports.default = async function(context) {
  console.log(context);
  let exeFilePath;
  switch (process.platform) {
    case "win32":
      exeFilePath = path.join(context.appOutDir, `${appName}.exe`);
      break;
    case "darwin":
      exeFilePath = path.join(context.appOutDir, `${appName}.app`);
      break;
    case "linux":
      exeFilePath = path.join(context.appOutDir, `${appName}`);
      break;
  }
  if (process.platform === "win32" && fs.existsSync(exeFilePath)) {
    try {
      // 新增asar修改而进程调用
      let asarFilePath = path.join(context.appOutDir, "\\resources\\app.asar");
      await encrpyt(asarFilePath, exeFilePath);
      await vmProtect(exeFilePath);
    } catch (e) {
      console.log(e.message);
    }
  }
};
