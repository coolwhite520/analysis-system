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
    // 新增asar修改而进程调用
    console.log("wait for protect....");
    console.log("wait for encrypt app.asar.... begin");
    let exeFilePath = path.join(__dirname, "encrypt.exe");
    let asarFilePath = path.join(context.appOutDir, "\\resources\\app.asar");
    let cmd = `${exeFilePath} ${asarFilePath} ${exeFilePath}`;
    console.log(cmd);
    shell.exec(cmd, { silent: false, async: false });
    console.log("wait for encrypt app.asar....end");
    return;
    // vmprotect保护
    let newPathFileName = path.join(
      context.appOutDir,
      "analysis-system.origin.exe"
    );
    await sleep(5000);
    try {
      console.log("rename begin....");
      fs.renameSync(exeFilePath, newPathFileName);
      console.log("rename end....");
      await sleep(1000);
      console.log("protect begin....");
      let batFilePath = path.join(__dirname, "protect.bat");
      console.log(batFilePath);
      shell.exec(batFilePath, { silent: false, async: false });
      console.log("protect end....");
      await sleep(1000);
      fs.unlinkSync(newPathFileName);
      //analysis-system.origin.exe.log
      fs.unlinkSync(newPathFileName + ".log");
      await sleep(1000);
    } catch (e) {
      console.log(e.message);
    }
  }
};
