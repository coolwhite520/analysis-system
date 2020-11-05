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
    console.log("wait for protect....")
    await sleep(5000);
    try {
      console.log("rename begin....")
      fs.renameSync(exeFilePath, newPathFileName);
      console.log("rename end....")
      await sleep(1000);
      console.log("protect begin....");
      let batFilePath = path.join(__dirname, "protect.bat");
      console.log(batFilePath);
      shell.exec(batFilePath, { silent: false, async: false});
      console.log("protect end....")
      await sleep(1000);
      fs.unlinkSync(newPathFileName);
      //analysis-system.origin.exe.log
      fs.unlinkSync(newPathFileName + ".log");
      await sleep(1000);
    } catch(e) {
      console.log(e.message)
    }
   
  }
};
