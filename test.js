var regedit = require("regedit");
const moment = require("moment");
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

(async () => {
  var str = "19700405030201";
  var str2 = "20090522081601999";
  var regExp = /(\d{4})(?:\-)?([0]{1}\d{1}|[1]{1}[0-2]{1})(?:\-)?([0-2]{1}\d{1}|[3]{1}[0-1]{1})(?:\s)?([0-1]{1}\d{1}|[2]{1}[0-3]{1})(?::)?([0-5]{1}\d{1})(?::)?([0-5]{1}\d{1})/; //未使用g选项
  var res = str2.match(regExp);
  console.log(res); //输出[ 'aaa', index: 0, input: 'aaabbbcccaaabbbccc' ]
})();
