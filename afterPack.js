const { resolve } = require("path");

async function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("done");
      resolve("done");
    }, ms);
  });
}

exports.default = async function(context) {
  const path = require("path");
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
  const fs = require("fs");
  if (fs.existsSync(exeFilePath)) {
    await sleep(1000 * 3);
    console.log("sleep 3s");
  }
};
