var regedit = require("regedit");

//in electrion
// "extraResources": [
//   {
//     "from": "node_modules/regedit/vbs",
//     "to": "regedit/vbs",
//     "filter": [
//       "**/*"
//     ]
//   }
// ]
// const vbsDirectory = path.join(path.dirname(electron.remote.app.getPath('exe')), 'resources/regedit/vbs');
// regedit.setExternalVBSLocation(vbsDirectory);

async function listRegPath(regPath) {
  return new Promise((resolve, reject) => {
    regedit.list(regPath, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

(async () => {
  let ret = await listRegPath("HKCU\\SOFTWARE");
  console.log(ret);
})();
