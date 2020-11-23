var regedit = require("regedit");
const moment = require("moment");
const path = require("path");
const fs = require("fs");
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
Date.prototype.Format = function(fmt) {
  //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

async function listRegPath(regPath) {
  return new Promise((resolve, reject) => {
    regedit.list(regPath, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function readFileList(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList); //递归读取文件
    } else {
      if ([".xls", ".txt", ".csv", ".xlsx"].includes(path.extname(fullPath))) {
        filesList.push(fullPath);
      }
    }
  });
  return filesList;
}

(async () => {
  let fsList = [];
  readFileList("/Users/baiyang/Desktop/3709318620200623160533", fsList);
  console.log(fsList);
})();
