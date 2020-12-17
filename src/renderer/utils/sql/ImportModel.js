import Default from "./Default";
const log = require("@/utils/log");
class Dictionary {
  constructor() {
    this.datastore = new Array();
  }
  find(key) {
    return this.datastore[key];
  }
  remove(key) {
    delete this.datastore[key];
  }
  showAll() {
    var str = "";
    for (var key in this.datastore) {
      str += key + " -> " + this.datastore[key] + "; ";
    }
  }
  count() {
    var n = 0;
    for (var key in Object.keys(this.datastore)) {
      ++n;
    }
    return n;
  }
  clear() {
    for (var key in this.datastore) {
      delete this.datastore[key];
    }
  }
  ContainsKey(str) {
    for (var key in this.datastore) {
      if (key == str) {
        return true;
      }
    }
    return false;
  }
}
const ImportFileClass = {
  // Token: 0x0400050C RID: 1292
  Normal: 0, //资金
  // Token: 0x0400050D RID: 1293
  FanXiQian: 1, //反洗钱
  // Token: 0x0400050E RID: 1294
  DiSanFang: 2, //第三方
  // Token: 0x0400050F RID: 1295
  SheShui: 3, //涉税
  // Token: 0x04000510 RID: 1296
  HaiGuan: 4, //海关
  // Token: 0x04000511 RID: 1297
  HuaDan: 5, //话单
  // Token: 0x04000512 RID: 1298
  RenYuanXinXi: 6, //人员信息
  // Token: 0x04000513 RID: 1299
  HuiLv: 6, //汇率
  // Token: 0x04000514 RID: 1300
  GuanXiRen: 7, //关系人
  // Token: 0x04000515 RID: 1301
  WaiGuan: 8,
  // Token: 0x04000516 RID: 1302
  JASS: 9, //JASS
  // Token: 0x04000517 RID: 1303
  SheJiao: 10, //社交
  // Token: 0x04000518 RID: 1304
  WuLiu: 11, //物流
  // Token: 0x04000519 RID: 1305
  GongShang: 12, //工商
  // Token: 0x0400051A RID: 1306
  ZiDingYi: 13, //自定义
};
const list_0 = [
  /^(\d+[时])?(\d+[分])?(\d+[秒])/,
  /^(\d+?['])?(\d+[']['])?(\d+?['][']['])/,
  /^(\d+?[’])?(\d+?[’][’])?(\d+[’][’][’])/,
];
const list_1 = [
  ["时", "分", "秒"],
  ["'", "''", "'''"],
  ["’", "’’", "’’’"],
];
const specialstr = "_x000D_";
const Judge = [1, 2, 3, 4, 5, 6];

let MatchDic = new Default.Dictionary();
let ReplaceDic = new Default.Dictionary();
const xmldata = [{ Grade: "0", OldStr: "钟", NewStr: "" }]; //Grade:序号,将旧值替换为新值

const companys = ["公司", "企业", "集团", "工作室", "研究院", "研究所", "中心"];

function DataChangeModel(Grade, OldStr, NewStr) {
  //this.Times=Times;
  // Token: 0x040001F1 RID: 497
  this.Grade = Grade;
  // Token: 0x040001F2 RID: 498
  //this.InnerValue=InnerValue;
  // Token: 0x040001F3 RID: 499
  this.OldStr = OldStr;
  // Token: 0x040001F4 RID: 500
  this.NewStr = NewStr;
}

function GetReplaceString(fieldname) {
  try {
    if (!MatchDic.ContainsKey(fieldname)) {
      let concurrentDictionary = new Default.Dictionary();
      for (let i = 0; i < xmldata.length; i++) {
        let matchObj = new DataChangeModel(
          xmldata[i]["Grade"],
          xmldata[i]["OldStr"],
          xmldata[i]["NewStr"]
        ); //replace xml
        if (concurrentDictionary.ContainsKey(matchObj.Grade)) {
          concurrentDictionary.datastore[matchObj.Grade].push(matchObj);
        }
        concurrentDictionary.add(matchObj.Grade, [matchObj]);
      }
      MatchDic.add(fieldname, concurrentDictionary);
    }
  } catch (e) {
    console.log("数据替换的时候出错", e.message);
  }
}
function ChangeField(text, fieldname) {
  let result;
  try {
    if (
      Object.keys(ReplaceDic.datastore).length == 0 &&
      MatchDic != null &&
      Object.keys(MatchDic.datastore).length > 0 &&
      MatchDic.ContainsKey(fieldname)
    ) {
      let concurrentDictionary = MatchDic.datastore[fieldname];
      let len = Object.keys(concurrentDictionary.datastore).length;
      for (let i = 0; i < len; i++) {
        if (concurrentDictionary.ContainsKey(String(i))) {
          let list = concurrentDictionary.datastore[String(i)];
          if (list != null) {
            for (let j = 0; j < list.length; j++) {
              let current = list[j];
              if (
                current != null &&
                Default.IsNullOrEmpty(current.OldStr) &&
                !ReplaceDic.ContainsKey(current.OldStr)
              ) {
                ReplaceDic.add(current.OldStr, current.NewStr);
              }
            }
          }
        }
      }
    }
    for (let i = 0; i < Object.keys(ReplaceDic.datastore).length; i++) {
      let key = Object.keys(ReplaceDic.datastore)[i];
      if (text.indexOf(key) >= 0) {
        text = text.replace(new RegExp(text, "g"), ReplaceDic.datastore[key]);
      }
    }
    result = text;
  } catch (e) {
    console.log("替换转化的时候失败");
    result = text;
  }
  return result;
}
function CangeTime(strtime1) {
  let result;
  try {
    let num = 0;
    GetReplaceString("timelength");
    strtime1 = ChangeField(strtime1, "timelength");
    for (let i = 0; i < list_0.length; i++) {
      if (RegExp(list_0[i]).test(strtime1)) {
        let input = strtime1;
        if (i != 0) {
          if (i <= 2) {
            let array = input.split(list_1[i][2]);
            input = array[0];
            array = input.split(list_1[i][1]);
            if (array.length > 1) {
              if (!Default.IsNullOrEmpty(array[1])) {
                num += parseInt(array[1]); //秒
              }
            }
            array = input.split(list_1[i][0]);
            if (array.length > 1) {
              if (!Default.IsNullOrEmpty(array[0])) {
                let num3 = parseInt(array[0]); //时
                num += 3600 * num3;
              }
              if (!Default.IsNullOrEmpty(array[1])) {
                let num4 = parseInt(array[1]); //分
                num += 60 * num3;
              }
            } else if (!Default.IsNullOrEmpty(array[0])) {
              let num5 = parseInt(array[0]); //分
              num += 60 * num5;
            }
          }
        } else {
          let array2 = input.split(list_1[i][0]);
          if (array2.length > 1) {
            if (!Default.IsNullOrEmpty(array2[0])) {
              let num6 = parseInt(array2[0]); //时
              num += 3600 * num6;
            }
            input = array2[1];
          }
          array2 = input.split(list_1[i][1]);
          if (array2.length > 1) {
            if (!Default.IsNullOrEmpty(array2[0])) {
              let num7 = parseInt(array2[0]); //分
              num += 60 * num7;
            }
            input = array2[1];
          }
          array2 = input.split(list_1[i][2]);
          if (array2.length > 1 && !Default.IsNullOrEmpty(array2[0])) {
            let num8 = parseInt(array2[0]); //分
            num += num8;
          }
        }
      }
    }
    result = String(num);
  } catch (e) {
    console.log("通话时间转化出错");
    result = strtime1;
  }
  return result;
}

function TestingHandle(
  Columns,
  dataRow,
  tablename = "",
  /*impotrt=ImportFileClass.DiSanFang,*/ inFlag = "进",
  outFlag = "出",
  fileName = ""
) {
  try {
    if (tablename.startsWith("gas_phone_call_info")) {
      // 给调单方姓名赋值
      if (Columns.includes("ddfzsxm")) {
        if (!dataRow.hasOwnProperty("ddfzsxm")) {
          // 用文件名填充
          dataRow["ddfzsxm"] = fileName;
        }
      }
      if (Columns.includes("thsj")) {
        // dataRow["thsj"]=dataRow["thsj"].replace(/\//g,'-');
        if (dataRow.hasOwnProperty("hjrq") && dataRow.hasOwnProperty("hjsj")) {
          dataRow["thsj"] =
            getfulltime_(dataRow["hjrq"]).date +
            " " +
            getfulltime_(dataRow["hjsj"]).time;
        } else if (dataRow.hasOwnProperty("thsj")) {
          let t = getfulltime_("thsj");
          dataRow["thsj"] = t.date + " " + t.time;
        }
      }
      if (dataRow.hasOwnProperty("cxsj")) {
        dataRow["cxsj"] = dataRow["cxsj"].replace(/\//g, "-");
        let text = Default.IsNullOrEmpty(dataRow["cxsj"])
          ? ""
          : dataRow["cxsj"];
        if (text != "" && !RegExp(/^\d+$/).test(text)) {
          text = CangeTime(text);
          dataRow["cxsj"] = text;
        }
      }
    }
    if (tablename.startsWith("gas_tax_records")) {
      try {
        if (Columns.includes("kpyf")) {
          if (Columns.includes("kprq")) {
            let text2 = Default.IsNullOrEmpty(dataRow["kprq"])
              ? ""
              : dataRow["kprq"];
            let res = RegExp(
              /(^[2-9]\d{3})(?:\-|\/)?([0]{1}\d{1}|[1]{1}[0-2]{1}|[1-9]{1}).*$/
            ).exec(text2);
            if (res) {
              dataRow["kpyf"] = res[1] + "-" + res[2];
            } else if (!Default.IsNullOrEmpty(dataRow["kpyf"])) {
              let text3 = dataRow["kpyf"];
              if (
                RegExp(/^\d{6}$/).test(text3) ||
                RegExp(/^\d{5}$/).test(text3)
              ) {
                dataRow["kpyf"] = text3.slice(0, 4) + "-" + text3.slice(4);
              }
            }
          } else if (!Default.IsNullOrEmpty(dataRow["kpyf"])) {
            let text4 = dataRow["kpyf"];
            if (
              RegExp(/^\d{6}$/).test(text4) ||
              RegExp(/^\d{5}$/).test(text4)
            ) {
              dataRow["kpyf"] = text4.slice(0, 4) + "-" + text4.slice(4);
            }
          }
        }
      } catch (e) {
        console.log("开票月份读取出错", e);
      }
    }
    if (
      tablename.startsWith(
        "gas_bank_records"
      ) /*&& impotrt == ImportFileClass.Normal*/
    ) {
      try {
        if (!dataRow.hasOwnProperty("jdbz")) {
          dataRow["jdbz"] = "";
        }
        if (!Default.IsNullOrEmpty(dataRow["jdbz"])) {
          let text5 = dataRow["jdbz"];
          if (text5.length > 0) {
            if (text5 == inFlag) {
              dataRow["jdbz"] = "进";
            } else if (text5 == outFlag) {
              dataRow["jdbz"] = "出";
            } else {
              dataRow["jdbz"] = "进";
            }
          } else {
            dataRow["jdbz"] = "出";
          }
          if (dataRow.hasOwnProperty("jyje")) {
            let double_money = parseFloat(dataRow["jyje"]);
            if (!isNaN(double_money)) {
              dataRow["jyje"] = String(Math.abs(double_money));
            }
          }
        } else if (!Columns.includes("jkje") && !Columns.includes("dkje")) {
          if (
            Columns.includes("jyje") &&
            dataRow.hasOwnProperty("jyje") &&
            dataRow["jyje"] != "0"
          ) {
            let num2 = parseFloat(dataRow["jyje"]);
            if (!isNaN(num2)) {
              if (num2 > 0) {
                dataRow["jdbz"] = "进";
              } else if (num2 < 0) {
                dataRow["jdbz"] = "出";
                dataRow["jyje"] = String(Math.abs(num2));
              }
            }
          }
        } else {
          let num3 = 0;
          let num4 = 0;
          if (Columns.includes("jkje") && dataRow.hasOwnProperty("jkje")) {
            let temp = parseFloat(dataRow["jkje"]);
            num3 = isNaN(temp) ? 0 : temp;
          }
          if (Columns.includes("dkje") && dataRow.hasOwnProperty("dkje")) {
            let temp = parseFloat(dataRow["dkje"]);
            num4 = isNaN(temp) ? 0 : temp;
          }
          if (num3 != 0) {
            dataRow["jdbz"] = "出";
            if (!Columns.includes("jyje")) {
              dataRow["jyje"] = "";
            }
            if (num3 < 0) {
              num3 = Math.abs(num3);
              dataRow["jdbz"] = "进";
            }
            dataRow["jyje"] = num3;
          } else if (num4 != 0) {
            dataRow["jdbz"] = "进";
            if (!Columns.includes("jyje")) {
              dataRow["jyje"] = "";
            }
            if (num4 < 0) {
              num4 = Math.abs(num4);
              dataRow["jdbz"] = "出";
            }
            dataRow["jyje"] = num4;
          } else if (
            Columns.includes("jyje") &&
            dataRow.hasOwnProperty("jyje") &&
            dataRow["jyje"] != "0"
          ) {
            let num5 = parseFloat(dataRow["jyje"]);
            if (!isNaN(num5)) {
              if (num5 > 0) {
                dataRow["jdbz"] = "进";
              } else if (num5 < 0) {
                dataRow["jdbz"] = "出";
                dataRow["jyje"] = String(Math.abs(num5));
              }
            }
          }
        }
        if (Default.IsNullOrEmpty(dataRow["jdbz"])) {
          dataRow["jdbz"] = "出";
        }
      } catch (e) {
        console.log("借贷标志转，交易金额先关转化化出错");
      }
    }
    if (
      tablename.startsWith("gas_phone_call_info") &&
      Columns.includes("fx") &&
      dataRow.hasOwnProperty("fx")
    ) {
      let expr_9D5 = dataRow["fx"];
      if (dataRow["fx"] == inFlag) {
        dataRow["fx"] = "主叫";
      } else {
        dataRow["fx"] = "被叫";
      }
    }
    if (Columns.includes("cxzh") && Columns.includes("cxkh")) {
      if (
        !Default.IsNullOrEmpty(dataRow["cxkh"]) &&
        Default.IsNullOrEmpty(dataRow["cxzh"])
      ) {
        dataRow["cxzh"] = dataRow["cxkh"];
      } else if (
        !Default.IsNullOrEmpty(dataRow["cxzh"]) &&
        Default.IsNullOrEmpty(dataRow["cxkh"])
      ) {
        dataRow["cxkh"] = dataRow["cxzh"];
      }
    }
    if (Columns.includes("zh") && Columns.includes("kh")) {
      if (
        !Default.IsNullOrEmpty(dataRow["kh"]) &&
        Default.IsNullOrEmpty(dataRow["zh"])
      ) {
        dataRow["zh"] = dataRow["kh"];
      } else if (
        !Default.IsNullOrEmpty(dataRow["zh"]) &&
        Default.IsNullOrEmpty(dataRow["kh"])
      ) {
        dataRow["kh"] = dataRow["zh"];
      }
    }
    if (
      Columns.includes("jshj") &&
      Columns.includes("se") &&
      Columns.includes("je")
    ) {
      if (Default.IsNullOrEmpty(dataRow["se"])) {
        dataRow["se"] = "0.00";
      }
      if (Default.IsNullOrEmpty(dataRow["je"])) {
        dataRow["je"] = "0.00";
      }
      let se = isNaN(parseFloat(dataRow["se"])) ? 0 : parseFloat(dataRow["se"]);
      let je = isNaN(parseFloat(dataRow["je"])) ? 0 : parseFloat(dataRow["je"]);
      dataRow["jshj"] = String((se + je).toFixed(2));
      if (dataRow["jshj"].indexOf(",") >= 0) {
        dataRow["jshj"] = dataRow["jshj"].replace(/,/g, "");
      }
    }
    if (
      Columns.includes("zzhm") &&
      Columns.includes("khmc") &&
      !Default.IsNullOrEmpty(dataRow["zzhm"])
    ) {
      let flag =
        companys.findIndex((el) => {
          return dataRow["khmc"].indexOf(el) >= 0;
        }) != -1;
      dataRow["zzlx"] =
        (dataRow["zzhm"].length < 15 && dataRow["khmc"].length > 4) | flag
          ? "dz1"
          : "z1";
      dataRow["zzlxmc"] =
        (dataRow["zzhm"].length < 15 && dataRow["khmc"].length > 4) | flag
          ? "企业法人营业执照"
          : "居民身份证";
      dataRow["sjlx"] =
        (dataRow["zzhm"].length < 15 && dataRow["khmc"].length > 4) | flag
          ? "98"
          : "99";
    }
    if (Columns.includes("jysj") && Columns.includes("jyrq")) {
      // if (
      //   !Default.IsNullOrEmpty(dataRow["jysj"]) ||
      //   !Default.IsNullOrEmpty(dataRow["jyrq"])
      // )
      {
        let jyrq = null;
        let jysj = null;
        if (!Default.IsNullOrEmpty(dataRow["jysj"])) {
          jysj = getfulltime_(dataRow["jysj"]);
        }
        if (!Default.IsNullOrEmpty(dataRow["jyrq"])) {
          jyrq = getfulltime_(dataRow["jyrq"]);
        }
        let date =
          jyrq == null ? (jysj == null ? "0001-01-01" : jysj.date) : jyrq.date;
        let time =
          jysj == null ? (jyrq == null ? "00:00:00" : jyrq.time) : jysj.time;
        let fulltime = date + " " + time;
        dataRow["jyrq"] = fulltime;
        dataRow["jysj"] = fulltime;
      }
    }
  } catch (e) {
    console.log(e.message);
  }
  return dataRow;
}
function getfulltime_(str) {
  try {
    if (!isNaN(str) || str.split(" ").length > 1) {
      let reg = RegExp(
        /([2-9]\d{3})(?:\-|\/|\s)?([0]{1}\d{1}|[1]{1}[0-2]{1}|[1-9]{1})(?:\-|\/|\s)?([0-2]{1}\d{1}|[3]{1}[0-1]{1}|[1-9]{1})(?:\s)?([0-1]{1}\d{1}|[2]{1}[0-3]{1}|[0-9]{1})(?::)?([0-5]{1}\d{1}|[1-9]{1})(?::)?([0-5]{1}\d{1}|[1-9]{1})?/
      ).exec(str);
      if (reg) {
        //console.log(reg )
        let year = reg[1];
        let month = reg[2].length == 1 ? "0" + reg[2] : reg[2];
        let day = reg[3].length == 1 ? "0" + reg[3] : reg[3];
        let hour = reg[4].length == 1 ? "0" + reg[4] : reg[4];
        let minute = reg[5].length == 1 ? "0" + reg[5] : reg[5];
        let sec =
          reg[6] == undefined
            ? "00"
            : reg[6].length == 1
            ? "0" + reg[6]
            : reg[6];
        return {
          date: year + "-" + month + "-" + day,
          time: hour + ":" + minute + ":" + sec,
        };
      }
    }
    let reg_data = RegExp(
      /([2-9]\d{3})(?:\-|\/)?([0]{1}\d{1}|[1]{1}[0-2]{1}|[1-9]{1})(?:\-|\/)?([0-2]{1}\d{1}|[3]{1}[0-1]{1}|[1-9]{1})/
    ).exec(str);
    if (reg_data) {
      //console.log(reg_data )
      let year = reg_data[1];
      let month = reg_data[2].length == 1 ? "0" + reg_data[2] : reg_data[2];
      let day = reg_data[3].length == 1 ? "0" + reg_data[3] : reg_data[3];
      return { date: year + "-" + month + "-" + day, time: "00:00:00" };
    }
    let reg_time = RegExp(
      /([0-1]{1}\d{1}|[2]{1}[0-3]{1}|[0-9]{1})(?::)?([0-5]{1}\d{1}|[0-9]{1})(?::)?([0-5]{1}\d{1}|[0-9]{1})?/
    ).exec(str);
    if (reg_time) {
      let hour = reg_time[1].length == 1 ? "0" + reg_time[1] : reg_time[1];
      let minute = reg_time[2].length == 1 ? "0" + reg_time[2] : reg_time[2];
      let sec =
        reg_time[3] == undefined
          ? "00"
          : reg_time[3].length == 1
          ? "0" + reg_time[3]
          : reg_time[3];
      return { date: "0001-01-01", time: hour + ":" + minute + ":" + sec };
    }
    return { date: "0001-01-01", time: "00:00:00" };
  } catch (e) {
    console.log(e.message);
    return { date: "0001-01-01", time: "00:00:00" };
  }
}
// let e = TestingHandle(
//   ["hjrq", "hjsj", "thsj", "fx", "cxsj"],
//   { hjrq: "2019/4/5", hjsj: "12:12:12", thsj: "", cxsj: "1时1分1秒", fx: "1" },
//   "gas_phone_call_info",
//   ImportFileClass.DiSanFang,
//   "1",
//   "0"
// );
// log.info(e);

export default {
  TestingHandle,
};
