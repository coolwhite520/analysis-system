const regedit = require("regedit");
const path = require("path");
const fs = require("fs");
const electron = require("electron");
//in electrion

async function listRegPath(regPath) {
  return new Promise((resolve, reject) => {
    const vbsDirectory = path.join(
      path.dirname(electron.remote.app.getPath("exe")),
      "resources/regedit/vbs"
    );
    regedit.setExternalVBSLocation(vbsDirectory);
    regedit.list(regPath, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function existServiceBinFile() {
  try {
    let regPath =
      "HKLM\\SOFTWARE\\PostgreSQL\\Installations\\postgresql-x64-12";
    let ret = await listRegPath(regPath);
    if (ret) {
      let installPath = ret[regPath].values["Base Directory"].value;
      console.log(installPath);
      let binServicePath = path.join(installPath, "\\bin\\pg_ctl.exe");
      if (fs.existsSync(binServicePath)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

export default { existServiceBinFile };
