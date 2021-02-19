///////////资金穿透模型////////////////
import Default from "./Default";
import base from "../../db/Base";
import Aes from "../aes";
//连接类型

const LinkPathType = {
  link: 1, //链路查找
  // Token: 0x04000C63 RID: 3171
  circle: 2, //环路查找
  // Token: 0x04000C64 RID: 3172
  endtoend: 3, //两端路径查找
};
const DataItemType = {
  Detail: 0,
  Sum: 1,
  Diff: 2,
};
const SearchType = {
  kh: 0,
  zjhm: 1,
  mc: 2,
};
// (async () => {
//   let linkParameters = new LinkParameters(
//     LinkPathType.link, //连接类型
//     SearchType.kh, //查询类型0卡号，1证件号，2名称
//     DataItemType.Detail, //维度
//     false, //是否为组
//     "xy", //方向
//     8, //查询最大层数
//     2, //查询最小层数
//     "6228480445779753174", //起点
//     "", //终点
//     "", //起始时间0001-01-01 00:00:00
//     "", //终止时间Default.getNowFormatDate(1)
//     2000, //最小交易金额
//     0, //最小笔数
//     48, //间隔时间
//     0.9, //最小进出比
//     1.1, //最大进出比
//     "" //condition
//     //ajid
//   );
//   const res = await GetVisualModelData(linkParameters, 100);
//   let retdata = StartComputeInternal(
//     res.rows,
//     new BaseDataProvider(linkParameters),
//     linkParameters.DataItemType
//   );
//   console.log(retdata);
//   return retdata;
// })();
//string转时间
function stringToTime(string) {
  var f = string.split(" ", 2);
  var d = (f[0] ? f[0] : "").split("-", 3);
  var t = (f[1] ? f[1] : "").split(":", 3);
  return new Date(
    parseInt(d[0], 10) || null,
    (parseInt(d[1], 10) || 1) - 1,
    parseInt(d[2], 10) || null,
    parseInt(t[0], 10) || null,
    parseInt(t[1], 10) || null,
    parseInt(t[2], 10) || null
  ).getTime();
}
//计算时间差 （秒）
function dateDiff(date1, date2) {
  var type1 = typeof date1,
    type2 = typeof date2;
  if (type1 == "string") date1 = stringToTime(date1);
  else if (date1.getTime) date1 = date1.getTime();
  if (type2 == "string") date2 = stringToTime(date2);
  else if (date2.getTime) date2 = date2.getTime();
  return (date1 - date2) / 1000; //结果是秒
}
Array.prototype.Remove = function(dx) {
  if (dx == undefined || dx == null) {
    return false;
  }
  let flag = 0;
  for (var i = 0, n = 0; i < this.length; i++) {
    if (this[i] != dx) {
      this[n++] = this[i];
      flag += 1;
    }
  }
  this.length = flag;
};
function GetSqlTemplate(ajid) {
  return (
    "select '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkh else jydfzkh end cxkh, case when jdbz = '出' then jymc else jydfmc end jymc, case WHEN jdbz = '出' THEN jyzjhm ELSE jydfzjhm END jyzjhm, case when jdbz = '出' then jydfzkh else cxkh end jydfzkh, case when jdbz = '出' then jydfmc else jymc end jydfmc, case WHEN jdbz = '出' THEN jydfzjhm ELSE jyzjhm END jydfzjhm from mz_bank_records  where ajid = " +
    ajid +
    " and jysj is not null $parm1$ $parm2$ $parm3$ ORDER BY jymc "
  );
}
function GetGroupSqlTemplate(ajid) {
  return (
    "select '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkhgroup else jydfzkhgroup end cxkh, case when jdbz = '出' then jymcgroup else jydfmcgroup end jymc, case WHEN jdbz = '出' THEN jyzjhmgroup ELSE jydfzjhmgroup END jyzjhm, case when jdbz = '出' then jydfzkhgroup else cxkhgroup end jydfzkh, case when jdbz = '出' then jydfmcgroup else jymcgroup end jydfmc, case WHEN jdbz = '出' THEN jydfzjhmgroup ELSE jyzjhmgroup END jydfzjhm from " +
    Default.GetBankDetailTableSumSql("mz_bank_records") +
    " where ajid = " +
    ajid +
    " and jysj is not null $parm1$ $parm2$ $parm3$ ORDER BY jymc"
  ).replace(/\$AJID\$/g, ajid);
}
async function GetVisualModelData(linkParameters, caseId) {
  if (linkParameters.DataItemType == DataItemType.Detail) {
    let sql = GetDataTable_detail(linkParameters, caseId);
    if (sql != undefined && sql != null && sql != "") {
      console.log(sql);
      return await base.QueryCustom(sql, caseId);
    }
  }
  let filter = linkParameters.TradeMoney + "," + linkParameters.TradeCount;
  let condtion = "";
  let encodesql = "";
  let orderby = "";
  let res;
  if (linkParameters.VisualType == 0) {
    if (linkParameters.GroupVisiual) {
      res = await base.GetModelSql(205);
    } else {
      res = await base.GetModelSql(202);
    }
  } else if (linkParameters.VisualType == 1) {
    if (linkParameters.GroupVisiual) {
      res = await base.GetModelSql(206);
    } else {
      res = await base.GetModelSql(204);
    }
  } else if (linkParameters.VisualType == 2) {
    if (linkParameters.GroupVisiual) {
      res = await base.GetModelSql(207);
    } else {
      res = await base.GetModelSql(203);
    }
  }
  encodesql = res["gpsqltemplate"];
  orderby = res["orderby"];
  condtion = GetDateTimeFilter(linkParameters);
  let sql = GetAnalysisOtherTable(
    Aes.decrypt(encodesql),
    orderby,
    caseId,
    condtion,
    filter
  );
  if (sql != undefined && sql != null && sql != "") {
    return await base.QueryCustom(sql, caseId);
  }
  return null;
}
//模型sql格式化（资金穿透） condtion:过滤页面选择的时间，filter:TradeMoney + "," + TradeCount;或者MinPhoneNum+ "," + MinPhoneTime;
function GetAnalysisOtherTable(
  itemSql,
  sql_OrderBy,
  caseId,
  condtion = "",
  filter = ""
) {
  try {
    let array2 = filter.replace(/，/g, ",").split(",");
    return itemSql
      .replace(
        /\$MODEL_FILTER_GROUP\$/g,
        Default.GetBankDetailTableSql("mz_bank_records")
      )
      .replace(
        /\$MODEL_FILTER_GROUP_SUM\$/g,
        Default.GetBankDetailTableSumSql("mz_bank_records")
      )
      .replace(/\$AJID\$/g, caseId)
      .replace(/\$ZXJYJE_CONDITION\$/g, ">=")
      .replace(/\$JYBS_CONDITION\$/g, "")
      .replace(/\$MODEL_FILTER\$/g, condtion)
      .replace(/\$JYZJE\$/g, array2[0])
      .replace(/\$ZXJYZCS\$/g, ">= " + array2[1])
      .replace(/\$ZXKPFS\$/g, ">= " + array2[1])
      .replace(/\$ZXJSHJ\$/g, ">= " + array2[0])
      .replace(/\$THZSC\$/g, ">= " + array2[1])
      .replace(/\$THZCS\$/g, ">= " + array2[0])
      .replace(/\$MODEL_FILTER_CHILD\$/g, "")
      .replace(/\$SQLORDERBY\$/g, sql_OrderBy);
  } catch (e) {
    console.log(e);
    return null;
  }
}

function GetDateTimeFilter(linkParameters) {
  let text =
    " and " +
    Default.BackFiltrateCondtion_DateTime(
      Default.FiltrateLogicID.NotEmpty,
      linkParameters.StartTime,
      "JYSJ",
      Default.DataType.DATATIME_1
    );
  if (!Default.IsNullOrEmpty(linkParameters.StartTime)) {
    text =
      " and " +
      Default.BackFiltrateCondtion_DateTime(
        Default.FiltrateLogicID.GreaterOrEqual,
        linkParameters.StartTime,
        "JYSJ",
        Default.DataType.DATATIME_1
      );
  }
  if (!Default.IsNullOrEmpty(linkParameters.EndTime)) {
    text =
      text +
      " and " +
      Default.BackFiltrateCondtion_DateTime(
        Default.FiltrateLogicID.LessOrEqual,
        linkParameters.EndTime,
        "JYSJ",
        Default.DataType.DATATIME_1
      );
  }
  return text;
}
//单笔查询 获取sql  汇总或差额 存在模板sql
function GetDataTable_detail(linkParameters, ajid) {
  let arg_E0_0 =
    linkParameters.GroupVisiual == true
      ? GetGroupSqlTemplate(ajid)
      : GetSqlTemplate(ajid);
  let text = "";
  let text2 = "";
  let dateTimeFilter = GetDateTimeFilter(linkParameters);
  if (linkParameters.MinJyje > 0.0) {
    text = "and jyje>=" + linkParameters.MinJyje;
  }
  if (linkParameters.CxType == "kh") {
    text2 = "and COALESCE(cxkh,'')!='' and COALESCE(jydfzkh,'')!=''";
  } else if (linkParameters.CxType == "mc") {
    text2 = "and COALESCE(jymc,'')!='' and COALESCE(jydfmc,'')!=''";
  } else if (linkParameters.CxType == "zjhm") {
    text2 = "and COALESCE(jyzjhm,'')!='' and COALESCE(jydfzjhm,'')!=''";
  }
  return arg_E0_0
    .replace(/\$parm1\$/g, dateTimeFilter)
    .replace(/\$parm2\$/g, text)
    .replace(/\$parm3\$/g, text2);
}

function StartComputeInternal(dt, basedataprovider, dataitemtype) {
  let dt2;
  if (dataitemtype == DataItemType.Detail) {
    dt2 = DataTableToRowData_detail(dt, basedataprovider);
  } else if (dataitemtype == DataItemType.Sum) {
    dt2 = DataTableToRowData_sum(dt, basedataprovider);
  } else if (dataitemtype == DataItemType.Diff) {
    dt2 = DataTableToRowData_diff(dt, basedataprovider);
  }
  let basePathFinder = new BasePathFinder();
  basePathFinder.Init(basedataprovider.Paras);

  let source = basedataprovider.Paras.Source;
  // let list=[];
  // let arg_2B_0=[];
  basePathFinder.method_0(source, dt2);
  return basePathFinder.retData;
}
function DataTableToRowData_detail(dt, basedataprovider) {
  let dictionary = new Default.Dictionary(); //{string, RowData}
  for (let i = 0; i < dt.length; i++) {
    let rowData = new RowData(
      basedataprovider.Paras.Fx,
      basedataprovider.JYF,
      basedataprovider.DSF,
      dt[i]
    );
    if (dictionary.ContainsKey(rowData.FromKeyValue)) {
      dictionary.datastore[rowData.FromKeyValue].Group(rowData);
    } else {
      dictionary.add(rowData.FromKeyValue, rowData);
    }
  }
  return dictionary;
}
function DataTableToRowData_sum(dt, basedataprovider) {
  let dictionary = new Default.Dictionary(); //{string, RowData}
  for (let i = 0; i < dt.length; i++) {
    let dataRow = dt[i];
    let list = [];
    let valueOrDefault = parseFloat(dataRow["czje"]);
    let valueOrDefault2 = parseFloat(dataRow["jzje"]);
    if (valueOrDefault != 0.0) {
      let dataRow2 = SetRowData(
        dataRow,
        false,
        valueOrDefault,
        parseInt(dataRow["czbs"]),
        basedataprovider
      );
      list.push(dataRow2);
    }
    if (valueOrDefault2 != 0.0) {
      let dataRow3 = SetRowData(
        dataRow,
        true,
        valueOrDefault2,
        parseInt(dataRow["jzbs"]),
        basedataprovider
      );
      list.push(dataRow3);
    }
    for (let i = 0; i < list.length; i++) {
      let rowData = new RowData(
        basedataprovider.Paras.Fx,
        basedataprovider.JYF,
        basedataprovider.DSF,
        list[i]
      );
      if (dictionary.ContainsKey(rowData.FromKeyValue)) {
        dictionary.datastore[rowData.FromKeyValue].Group(rowData);
      } else {
        dictionary.add(rowData.FromKeyValue, rowData);
      }
    }
  }
  return dictionary;
}
function DataTableToRowData_diff(dt, basedataprovider) {
  let dictionary = new Default.Dictionary(); //{string, RowData}
  for (let i = 0; i < dt.length; i++) {
    let dataRow = dt[i];
    let valueOrDefault = parseFloat(dataRow["jczce"]);
    if (valueOrDefault != 0.0) {
      let valueOrDefault2 = parseInt(dataRow["czbs"]);
      let valueOrDefault3 = parseInt(dataRow["jzbs"]);
      let dataRow2 = SetRowData(
        dataRow,
        valueOrDefault > 0.0,
        Math.abs(valueOrDefault),
        Math.abs(valueOrDefault2 + valueOrDefault3),
        basedataprovider
      );
      let rowData = new RowData(
        basedataprovider.Paras.Fx,
        basedataprovider.JYF,
        basedataprovider.DSF,
        dataRow2
      );
      if (dictionary.ContainsKey(rowData.FromKeyValue)) {
        dictionary.datastore[rowData.FromKeyValue].Group(rowData);
      } else {
        dictionary.add(rowData.FromKeyValue, rowData);
      }
    }
  }
  return dictionary;
}

function SetRowData(
  sumordiffDBRow,
  needRevert,
  jyje,
  tradeCount,
  basedataprovider
) {
  let outRow = {
    jdbz: "",
    jysj: "",
    jyje: "",
    cxkh: "",
    jymc: "",
    jyzjhm: "",
    jydfzkh: "",
    jydfmc: "",
    jydfzjhm: "",
    istrue: "",
    jybs: "",
  };
  let array = ["cxkh", "jymc", "jyzjhm"];
  let array2 = ["jydfzkh", "jydfmc", "jydfzjhm"];
  let num = -1;
  if (basedataprovider.Paras.GroupVisiual) {
    if (basedataprovider.Paras.CxType == "kh") {
      num = 0;
    } else if (basedataprovider.Paras.CxType == "mc") {
      num = 1;
    } else {
      num = 2;
    }
  }
  outRow["jyje"] = jyje;
  outRow["jysj"] = "0001-01-01 00:00:00";
  outRow["jybs"] = tradeCount;
  for (let i = 0; i < array.length; i++) {
    let text = needRevert ? array2[i] : array[i];
    if (i == num) {
      text += "group";
    }
    outRow[array[i]] = GetItem(sumordiffDBRow, text);
  }
  for (let j = 0; j < array2.length; j++) {
    let text2 = needRevert ? array[j] : array2[j];
    if (j == num) {
      text2 += "group";
    }
    outRow[array2[j]] = GetItem(sumordiffDBRow, text2);
  }
  return outRow;
}

function GetItem(dataRow_0, string_2) {
  if (!dataRow_0.hasOwnProperty(string_2)) {
    return "";
  }
  if (dataRow_0[string_2] == null) {
    return "";
  }
  return dataRow_0[string_2];
}
//单笔选项参数 LinkPathViewModel  old
function LinkPathViewModel(
  LinkType = LinkPathType.link, //连接类型
  DataItemType = DataItemType.Diff, //维度  单笔，汇总，差额
  VisualType, //查询类型0卡号，1证件号，2名称
  isGroup = false, //是否为组
  start = "", //起点
  end = "", //重点
  fx = "xy", //方向
  MinJyje = 0.0, //最小交易金额
  TradeCount = 0, //最小交易笔数
  Mindepth = 2, //查询最小层数
  Depth = 8, //查询最大层数
  IntervalTime = 48, //间隔时间
  MinRatio = 0.9, //最小进出比
  MaxRatio = 1.1, //最大进出比
  starttime = "0001-01-01 00:00:00", //起始时间
  endtime = Default.getNowFormatDate(1) //终止时间
) {
  this.VisualType = VisualType; //0卡号，1证件号，2名称
  this.DataItemType = DataItemType;
  this.jyname = ""; //string_0
  this.dfjyname = ""; //string_1
  this.GroupVisiual = isGroup;
  this.CxType;
  if (this.VisualType == 0) {
    this.CxType = "kh";
    this.jyname = "cxkh";
    this.dfjyname = "jydfzkh";
  } else if (this.VisualType == 1) {
    this.CxType = "zjhm";
    this.jyname = "jyzjhm";
    this.dfjyname = "jydfzjhm";
  } else {
    this.CxType = "mc";
    this.jyname = "jymc";
    this.dfjyname = "jydfmc";
  }

  this.startlist = []; //list_1
  this.endlist = []; //list_2
  if (start != null && start != undefined && start.length > 0) {
    this.startlist = start.replace(/，/g, ",").split(",");
  }
  if (end != null && end != undefined && end.length > 0) {
    this.endlist = end.replace(/，/g, ",").split(",");
  }
  this.LinkType = LinkType;
  this.fx = fx;
  this.starttime = starttime == "" ? starttime : "0001-01-01 00:00:00";
  this.endtime = endtime == "" ? endtime : Default.getNowFormatDate(1);
  this.MinJyje = MinJyje;
  this.TradeMoney = MinJyje;
  this.TradeCount = TradeCount;
  this.Mindepth = Mindepth;
  this.Depth = Depth;
  this.IntervalTime = IntervalTime;
  this.MinRatio = MinRatio;
  this.MaxRatio = MaxRatio;
}
function BaseDataProvider(linkparameters) {
  this.Paras;
  this.JYF = "";
  this.DSF = "";
  this.Paras = linkparameters;

  if (this.Paras.CxType == "kh") {
    this.JYF = "cxkh";
    this.DSF = "jydfzkh";
  } else if (this.Paras.CxType == "mc") {
    this.JYF = "jymc";
    this.DSF = "jydfmc";
  } else if (this.Paras.CxType == "zjhm") {
    this.JYF = "jyzjhm";
    this.DSF = "jydfzjhm";
  }
}

function Node(dat, kh1, zjhm1, mc1) {
  this.data = dat;
  this.kh = kh1;
  this.zjhm = zjhm1;
  this.mc = mc1;
}
function NodeModel() {
  this.UniqueKey;
  this.FieldName;
  this.CardNo;
  this.Username;
  this.IdentityNo;
  this.InLinks = [];
  this.OutLinks = [];
  this.IsCutted;
  this.IsRoot = false;
  this.ToString = function() {
    return this.UniqueKey;
  };
  this.data = function() {
    return this.UniqueKey;
  };
  this.zjhm = function() {
    return this.IdentityNo;
  };
  this.mc = function() {
    return this.Username;
  };
}
function LinkModel(para) {
  this.From;
  this.To;
  this.double_0;
  this.dateTime_0;
  this.int_0;
  this.bool_0;
  this.bool_1;
  this.linkParameters_0 = para;
  this.set_From = function(value) {
    if (this.From != undefined && this.From != null) {
      this.From.OutLinks.Remove(this);
    }
    this.From = value;
    if (this.From != undefined && this.From != null) {
      this.From.OutLinks.push(this);
    }
  };
  this.set_To = function(value) {
    let expr_06 = this.To;
    if (expr_06 != null && expr_06 != undefined) {
      expr_06.InLinks.Remove(this);
    }
    this.To = value;
    let expr_24 = this.To;
    if (expr_24 == null) {
      return;
    }
    expr_24.InLinks.push(this);
  };
  this.TradeCount;
  this.TradeTime;
  this.TradeMoney;
  this.get_UniqueKey = function() {
    if (
      (this.From != undefined && this.From == null) ||
      (this.To != undefined && this.To == null)
    ) {
      return "";
    }
    if (this.linkParameters_0.DataItemType == DataItemType.Detail) {
      return (
        this.From.UniqueKey + "_" + this.To.UniqueKey + "_" + this.TradeTime
      );
    }
    if (this.linkParameters_0.DataItemType != DataItemType.Diff) {
      if (this.linkParameters_0.DataItemType != DataItemType.Sum) {
        return (
          this.From.UniqueKey +
          "_" +
          this.To.UniqueKey +
          "_" +
          this.TradeTime +
          "_" +
          this.TradeMoney
        );
      }
    }
    return this.From.UniqueKey + "_" + this.To.UniqueKey;
  };
  this.get_IsTargetValid = function() {
    return this.linkParameters_0.LinkType == LinkPathType.link || this.bool_1;
  };
  this.set_IsTargetValid = function(value) {
    this.bool_1 = value;
  };
  this.IsMinDepthValid;
  this.get_je = function() {
    return this.TradeMoney;
  };
  this.ToString = function() {
    return (
      this.From.ToString() +
      "->" +
      this.To.ToString() +
      "," +
      this.dataTime() +
      "," +
      this.TradeMoney
    );
  };
  this.RET = function() {
    return {
      dataType: this.linkParameters_0.DataItemType, // 单笔，汇总，差额
      source: this.From.ToString(),
      target: this.To.ToString(),
      tradeMoney: this.TradeMoney,
      tradeTime: this.TradeTime,
      tradeCount: this.TradeCount,
    };
  };
  this.dataTime = function() {
    if (this.linkParameters_0.DataItemType == DataItemType.Detail) {
      return this.TradeTime;
    }
    return this.TradeCount + "笔交易";
  };
  this.Remove = function() {
    if (this.From != null) {
      //console.log("remove:",this.ToString())
      this.From.OutLinks.Remove(this);
    }
    if (this.To != null) {
      //console.log("remove2:",this.ToString())
      this.To.InLinks.Remove(this);
    }
  };
  this.get_fromId = function() {
    return this.From.UniqueKey;
  };
  this.get_toId = function() {
    return this.To.UniqueKey;
  };
  this.get_dataTime = function() {
    if (this.linkParameters_0.DataItemType == DataItemType.Detail) {
      return this.TradeTime;
    }
    return this.TradeCount + "笔交易";
  };
}
function RowData(fx, jyf, dsf, row) {
  this.FX = fx;
  this.FromKey;
  this.ToKey;
  this.FromNode;
  this.ToNode;
  this.Time = row["jysj"];
  this.Money = row["jyje"];
  this.Count = row["jybs"] == undefined ? "0" : row["jybs"];
  this.IsDownFlow = this.FX == "xy";
  if (this.IsDownFlow) {
    this.FromKey = jyf;
    this.FromNode = new Node(row[jyf], row["cxkh"], row["jyzjhm"], row["jymc"]);
    this.ToKey = dsf;
    this.ToNode = new Node(
      row[dsf],
      row["jydfzkh"],
      row["jydfzjhm"],
      row["jydfmc"]
    );
  } else {
    this.ToKey = jyf;
    this.ToNode = new Node(row[jyf], row["cxkh"], row["jyzjhm"], row["jymc"]);
    this.FromKey = dsf;
    this.FromNode = new Node(
      row[dsf],
      row["jydfzkh"],
      row["jydfzjhm"],
      row["jydfmc"]
    );
  }
  this.ToKeyValue = this.ToNode.data;
  this.FromKeyValue = this.FromNode.data;
  this.ToString = function() {
    this.FromKeyValue + "->" + ToKeyValue + "," + this.Money;
  };
  this.list_0;
  this.get_GroupedItems = function() {
    if (this.list_0 == null || this.list_0 == undefined) {
      this.list_0 = new Array();
      this.list_0.push(this);
    }
    return this.list_0;
  };
  this.Group = function(data) {
    this.get_GroupedItems().push(data);
  };
  this.Sum = function() {};
}

function BasePathFinder() {
  this.Paras;
  this.resultNodes = [];
  this.resultLinks = [];
  this.retData = {};
  this.nodeDictionary = new Default.Dictionary(); //string, NodeModel
  this.linkDictionary = new Default.Dictionary(); //string, LinkModel
  this.linkParameters_0 = null;
  this.Init = function(linkParameters) {
    this.Paras = linkParameters;
  };
  this.method_0 = function(string_0, dt) {
    this.method_1(string_0, dt);

    let flag = false;
    flag = this.CheckTarget(string_0);
    if (flag) {
      this.method_5(string_0);
      this.GenerateResultData(string_0);
      // console.log(this.resultNodes)
      let links = [];
      let nodes = [];
      for (let i = 0; i < this.resultNodes.length; i++) {
        for (let j = 0; j < this.resultNodes[i].InLinks.length; j++) {
          let item = this.resultNodes[i].InLinks[j].RET();
          links.push(item);
        }
        let {
          CardNo,
          FieldName,
          IdentityNo,
          IsRoot,
          UniqueKey,
          Username,
        } = this.resultNodes[i];
        nodes.push({
          CardNo,
          FieldName,
          IdentityNo,
          IsRoot,
          UniqueKey,
          Username,
        });
      }

      // for (let i = 0; i < this.resultNodes.length; i++) {
      //   for (let k = 0; k < this.resultNodes[i].OutLinks.length; k++) {
      //     // console.log("OutLinks:", this.resultNodes[i].OutLinks[k].RET());
      //     let item = this.resultNodes[i].OutLinks[k].RET();
      //     links.push(item);
      //   }
      // }
      this.retData.links = links;
      this.retData.nodes = nodes;
    }
  };
  this.GenerateResultData = function(sourceNode) {
    if (!this.nodeDictionary.ContainsKey(sourceNode)) {
      return;
    }
    let nodeModel_ = this.nodeDictionary.datastore[sourceNode];
    let flag = true;
    flag = this.method_9(nodeModel_, new Default.Stack(), 1);
    this.method_10(nodeModel_);
  };
  this.method_9 = function(nodeModel_0, stack_0, int_0) {
    if (stack_0.data.includes(nodeModel_0.ToString())) {
      return false;
    }
    stack_0.push(nodeModel_0.ToString());
    let bool_0 = true;
    if (
      this.resultNodes.findIndex(
        (node) => node.ToString() == nodeModel_0.ToString()
      ) >= 0
    ) {
      return bool_0;
    }
    this.resultNodes.push(nodeModel_0);
    for (let i = nodeModel_0.OutLinks.length - 1; i >= 0; i--) {
      let linkModel = nodeModel_0.OutLinks[i];
      loop2: {
        if (!linkModel.IsMinDepthValid) {
          linkModel.Remove();
        } else if (!nodeModel_0.IsRoot && nodeModel_0.InLinks.length > 0) {
          let flag = false;
          let j = nodeModel_0.InLinks.length - 1;
          while (j >= 0) {
            if (!this.method_17(nodeModel_0.InLinks[j], linkModel, true)) {
              j--;
            } else {
              flag = true;
              if (!flag) {
                linkModel.Remove();
              }
              break loop2;
            }
          }
          if (!flag) {
            linkModel.Remove();
          }
        }
      }
    }
    int_0++;
    for (let k = nodeModel_0.OutLinks.length - 1; k >= 0; k--) {
      let linkModel2 = nodeModel_0.OutLinks[k];
      this.resultLinks.push(linkModel2);
      let flag2 = true;
      flag2 = this.method_9(linkModel2.To, stack_0, int_0);
      if (flag2) {
        stack_0.Pop();
      }
    }
  };
  this.CheckTarget = function(sourceNode) {
    if (!this.nodeDictionary.ContainsKey(sourceNode)) {
      return false;
    }
    if (this.Paras.LinkType == LinkPathType.link) {
      return true;
    }
    let key =
      this.Paras.LinkType == LinkPathType.circle
        ? sourceNode
        : this.Paras.Target;
    if (!this.nodeDictionary.ContainsKey(key)) {
      return false;
    }

    let nodeModel = this.nodeDictionary.datastore[sourceNode];
    let nodeModel2 = this.nodeDictionary.datastore[key];
    if (nodeModel.OutLinks.length != 0 && nodeModel2.InLinks.length != 0) {
      let hashSet = new Default.HashSet();
      let stack = new Default.Stack();
      for (let i = nodeModel.OutLinks.length - 1; i >= 0; i--) {
        let linkModel = nodeModel.OutLinks[i];
        if (!stack.data.includes(linkModel.ToString())) {
          stack.push(linkModel.ToString());
          if (this.method_4(linkModel, nodeModel2, hashSet, stack)) {
            linkModel.IsTargetValid = true;
            hashSet.add(linkModel.ToString(), linkModel);
          } else {
            linkModel.Remove();
          }
          stack.pop();
        }
      }
      for (let key_ in this.nodeDictionary.datastore) {
        try {
          let value = this.nodeDictionary.datastore[key_];
          for (let k = value.InLinks.length - 1; k >= 0; k--) {
            let linkModel2 = value.InLinks[k];
            if (!linkModel2.IsTargetValid) {
              linkModel2.Remove();
            }
          }
          for (let l = value.OutLinks.Count - 1; l >= 0; l--) {
            let linkModel3 = value.OutLinks[l];
            if (!linkModel3.IsTargetValid) {
              linkModel3.Remove();
            }
          }
        } catch (e) {
          console.log(e);
          continue;
        }
      }
      return true;
    }
    return false;
  };
  this.method_4 = function(linkModel_0, nodeModel_0, hashSet_0, stack_0) {
    if (hashSet_0.contains(linkModel_0.ToString())) {
      return true;
    }
    let to = linkModel_0.To;
    if (to.UniqueKey == nodeModel_0.UniqueKey) {
      return true;
    }
    if (to.OutLinks.length == 0) {
      return false;
    }
    let flag = false;
    let i = to.OutLinks.length - 1;
    while (i >= 0) {
      let linkModel = null;
      lp: {
        try {
          if (i >= to.OutLinks.length) {
            i--;
            continue;
          }
          linkModel = linkModel_0.To.OutLinks[i];
          break lp;
        } catch (e) {
          console.log(e);
          break lp;
        }
      }
      if (hashSet_0.contains(linkModel.ToString())) {
        flag = true;
        i--;
        continue;
      }
      if (!stack_0.data.includes(linkModel.ToString())) {
        stack_0.push(linkModel.ToString());
        let flag2;
        if (
          (flag2 = this.method_4(linkModel, nodeModel_0, hashSet_0, stack_0))
        ) {
          linkModel.IsTargetValid = true;
          hashSet_0.add(linkModel.ToString(), linkModel);
        } else {
          linkModel.Remove();
        }
        stack_0.pop();
        flag |= flag2;
      }
      i--;
      continue;
    }
    return flag;
  };
  this.method_5 = function(string_0) {
    if (this.Paras.Mindepth == 0) {
      return;
    }
    if (!this.nodeDictionary.ContainsKey(string_0)) {
      return;
    }
    let nodeModel = this.nodeDictionary.datastore[string_0];
    let stack = new Default.Stack();
    let hashSet = new Default.HashSet();
    //let flag = true;
    for (let i = nodeModel.OutLinks.length - 1; i >= 0; i--) {
      let linkModel = nodeModel.OutLinks[i];
      if (!stack.data.includes(linkModel.ToString())) {
        stack.push(linkModel.ToString());
        if (this.method_6(linkModel, 1, stack, hashSet)) {
          linkModel.IsMinDepthValid = true;
          hashSet.add(linkModel.ToString(), linkModel);
        }
        stack.pop();
      }
    }
  };
  this.method_6 = function(linkModel_0, int_0, stack_0, hashSet_0) {
    let bool_0 = false;
    let flag = false;
    if (int_0 >= this.Paras.Mindepth) {
      this.method_8(linkModel_0, hashSet_0);
      flag = true;
      //console.log(int_0)
      return true;
    }
    let to = linkModel_0.To;
    if (!to.IsRoot && to.OutLinks.length != 0) {
      //let flag = false;
      int_0++;
      for (let i = to.OutLinks.length - 1; i >= 0; i--) {
        let linkModel = to.OutLinks[i];
        if (!stack_0.data.includes(linkModel.ToString())) {
          stack_0.push(linkModel.ToString());
          let flag2;
          if ((flag2 = this.method_6(linkModel, int_0, stack_0, hashSet_0))) {
            //console.log(int_0)
            linkModel.IsMinDepthValid = true;
            hashSet_0.add(linkModel.ToString(), linkModel);
          }
          stack_0.pop();
          flag |= flag2;
        }
      }
      return flag;
    }
    return int_0 >= this.Paras.Mindepth;
  };
  this.method_8 = function(linkModel_0, hashSet_0) {
    if (hashSet_0.contains(linkModel_0.ToString())) {
      return;
    }
    linkModel_0.IsMinDepthValid = true;
    //console.log(linkModel_0.ToString() )
    hashSet_0.add(linkModel_0.ToString(), linkModel_0);
    let to = linkModel_0.To;
    if (to.IsRoot) {
      return;
    }
    for (let i = to.OutLinks.length - 1; i >= 0; i--) {
      let linkModel_ = to.OutLinks[i];
      this.method_8(linkModel_, hashSet_0);
    }
  };
  this.method_1 = function(source, dt) {
    this.resultNodes = [];
    this.resultLinks = [];
    this.nodeDictionary.clear();
    this.linkDictionary.clear();
    if (!dt.ContainsKey(source)) {
      return;
    }

    let nodeModel = this.method_15(dt.datastore[source]); //将目标节点存入nodeDictionary，并返回该节点
    nodeModel.IsRoot = true;
    let stack = new Default.Stack();
    stack.push(nodeModel.ToString()); //将当前节点入栈
    this.method_2(dt, nodeModel, 1, stack);
    stack.pop();
    this.method_10(nodeModel);
  };
  this.method_10 = function(nodeModel_0) {
    for (let i = nodeModel_0.OutLinks.length - 1; i >= 0; i--) {
      let linkModel = nodeModel_0.OutLinks[i];
      let to = linkModel.To;
      loop: {
        if (to != nodeModel_0) {
          let flag = false;
          let j = to.OutLinks.length - 1;
          while (j >= 0) {
            let linkModel_ = to.OutLinks[j];
            if (!this.method_17(linkModel, linkModel_, false)) {
              j--;
            } else {
              flag = true;
              if (!flag) {
                linkModel.Remove();
                this.resultLinks.Remove(linkModel);
                this.linkDictionary.remove(linkModel.get_UniqueKey());
              }
              break loop;
            }
          }

          if (!flag) {
            linkModel.Remove();
            this.resultLinks.Remove(linkModel);
            this.linkDictionary.remove(linkModel.get_UniqueKey());
          }
        }
      }
    }
  };
  this.method_2 = function(dictionary_0, nodeModel_0, int_0, stack_0) {
    if (this.Paras.Depth > 0 && int_0 > this.Paras.Depth) {
      return;
    }
    if (!dictionary_0.ContainsKey(nodeModel_0.UniqueKey)) {
      return;
    }
    let groupedItems = dictionary_0.datastore[
      nodeModel_0.UniqueKey
    ].get_GroupedItems();
    this.CreateValidLinks(nodeModel_0, groupedItems);
    int_0++;
    for (let i = nodeModel_0.OutLinks.length - 1; i >= 0; i--) {
      let to = nodeModel_0.OutLinks[i].To;
      if (!stack_0.data.includes(to.ToString())) {
        stack_0.push(to.ToString());
        this.method_2(dictionary_0, to, int_0, stack_0);
        stack_0.pop();
      }
    }
  };
  this.CreateValidLinks = function(fromNode, rows) {
    let list = [];
    for (let i = 0; i < rows.length; i++) {
      let current = rows[i];
      let linkModel = new LinkModel(this.Paras);
      linkModel.set_From(fromNode);
      linkModel.set_To(this.method_16(fromNode, current));
      linkModel.TradeMoney = current.Money;
      linkModel.TradeTime = current.Time;

      linkModel.TradeCount = current.Count;
      if (this.linkDictionary.ContainsKey(linkModel.get_UniqueKey())) {
        linkModel.Remove();
      } else {
        let flag = true;
        if (!fromNode.IsRoot && fromNode.InLinks.length > 0) {
          flag = false;
          for (let i = 0; i < fromNode.InLinks.length; i++) {
            if (this.method_17(fromNode.InLinks[i], linkModel, false)) {
              flag = true;
              break;
            }
          }
        }
        if (flag) {
          list.push(linkModel);
          this.linkDictionary.add(linkModel.get_UniqueKey(), linkModel);
        } else {
          linkModel.Remove();
        }
      }
    }
    return list;
  };
  this.method_17 = function(linkModel_0, linkModel_1, bool_0) {
    /*let arg_0D_0=linkModel_0.From;
      let arg_0D_1=linkModel_0.To;*/
    if (
      this.Paras.DataItemType == DataItemType.Detail &&
      this.Paras.IntervalTime >= 0
    ) {
      let timeSpan = this.Paras.IsDownDirection
        ? dateDiff(linkModel_1.TradeTime, linkModel_0.TradeTime)
        : dateDiff(linkModel_0.TradeTime, linkModel_1.TradeTime);
      let TotalHours = timeSpan / 3600;
      if (TotalHours < 0.0 || TotalHours > this.Paras.IntervalTime) {
        return false;
      }
    }
    let tradeMoney;
    let tradeMoney2;
    if (this.Paras.IsDownDirection) {
      tradeMoney = linkModel_0.TradeMoney;
      tradeMoney2 = linkModel_1.TradeMoney;
    } else {
      tradeMoney = linkModel_0.TradeMoney;
      tradeMoney2 = linkModel_1.TradeMoney;
    }
    return (
      (this.Paras.MinRatio <= 0.0 ||
        tradeMoney / tradeMoney2 >= this.Paras.MinRatio) &&
      (this.Paras.MaxRatio <= 0.0 ||
        tradeMoney / tradeMoney2 <= this.Paras.MaxRatio)
    );
  };
  this.method_16 = function(nodeModel_0, rowData_0) {
    let toKeyValue = rowData_0.ToKeyValue;
    let nodeModel;
    if (this.nodeDictionary.ContainsKey(toKeyValue)) {
      nodeModel = this.nodeDictionary.datastore[toKeyValue];
    } else {
      nodeModel = new NodeModel();
      nodeModel.CardNo = rowData_0.ToNode.kh;
      nodeModel.Username = rowData_0.ToNode.mc;
      nodeModel.IdentityNo = rowData_0.ToNode.zjhm;
      nodeModel.FieldName = rowData_0.ToKey;
      nodeModel.UniqueKey = rowData_0.ToKeyValue;
      this.nodeDictionary.add(toKeyValue, nodeModel);
    }
    return nodeModel;
  };
  this.method_15 = function(rowData_0) {
    let fromKeyValue = rowData_0.FromKeyValue;
    let nodeModel;
    if (this.nodeDictionary.ContainsKey(fromKeyValue)) {
      nodeModel = this.nodeDictionary[fromKeyValue];
    } else {
      nodeModel = new NodeModel();
      nodeModel.CardNo = rowData_0.FromNode.kh;
      nodeModel.Username = rowData_0.FromNode.mc;
      nodeModel.IdentityNo = rowData_0.FromNode.zjhm;
      nodeModel.FieldName = rowData_0.FromKey;
      nodeModel.UniqueKey = rowData_0.FromKeyValue;
      this.nodeDictionary.add(fromKeyValue, nodeModel);
    }
    return nodeModel;
  };
}

//资金穿透参数类
function LinkParameters(
  LinkType,
  VisualType,
  DataItemType_,
  GroupVisiual,
  Fx,
  Depth,
  Mindepth,
  Source,
  Target,
  StartTime,
  EndTime,
  MinJyje,
  TradeCount,
  IntervalTime,
  MinRatio,
  MaxRatio,
  Condtion,
  Ajid
) {
  this.LinkType = LinkType;
  this.VisualType = VisualType; //查询类型0卡号，1证件号，2名称
  this.CxType = "kh";
  if (this.VisualType == 0) {
    this.CxType = "kh";
  } else if (this.VisualType == 1) {
    this.CxType = "zjhm";
  } else if (this.VisualType == 2) {
    this.CxType = "mc";
  }
  this.Fx = Fx;
  this.Depth = Depth;
  this.Source = Source;
  this.Target = Target;

  this.StartTime = StartTime == "" ? StartTime : "0001-01-01 00:00:00";
  this.EndTime = EndTime == "" ? EndTime : Default.getNowFormatDate(1);
  this.MinJyje = MinJyje;
  this.TradeMoney = MinJyje;
  this.TradeCount = TradeCount;
  this.IntervalTime = IntervalTime;
  this.MinRatio = MinRatio;
  this.MaxRatio = MaxRatio;
  this.Condtion = Condtion;
  //this.Obj=Obj;
  this.Ajid = Ajid;
  this.Mindepth = Mindepth;
  this.DataItemType = DataItemType_;
  this.GroupVisiual = GroupVisiual;
  this.IsDownDirection = this.Fx == "xy";
}

export default {
  /**
   *
   *  modelType, //LinkPathType.link, //连接类型
      SearchType.zjhm, //查询类型0卡号，1证件号，2名称
      DataItemType.Detail, //维度
      false, //是否为组
      "xy", //方向
      8, //查询最大层数
      2, //查询最小层数
      "111111111", //起点
      "", //终点
      "0001-01-01 00:00:00", //起始时间
      Default.getNowFormatDate(1), //终止时间
      100000, //最小交易金额
      0, //最小笔数
      48, //间隔时间
      0.9, //最小进出比
      1.1, //最大进出比
      "", //condition
      ajid
   * @param {模型类型：包括链路、环路、两端} linkType
   * @param {维度类型：} weiDuType
   * @param {查询类型：} searchType
   *
   * @param {} ajid
   */
  async getCapitalPenetration(
    modelType,
    searchType,
    weiDuType,
    isGroup,
    directrion,
    searchMaxCeng,
    searchMinCeng,
    beginPoint,
    endPoint,
    beginDate,
    endDate,
    minJyje,
    minBs,
    timeSpan,
    minJcb,
    maxJcb,
    condition,
    ajid
  ) {
    let linkParameters = new LinkParameters(
      modelType,
      searchType,
      weiDuType,
      isGroup,
      directrion,
      searchMaxCeng,
      searchMinCeng,
      beginPoint,
      endPoint,
      beginDate,
      endDate,
      minJyje,
      minBs,
      timeSpan,
      minJcb,
      maxJcb,
      condition,
      ajid
    );
    const res = await GetVisualModelData(linkParameters, ajid);
    let retdata = StartComputeInternal(
      res.rows,
      new BaseDataProvider(linkParameters),
      linkParameters.DataItemType
    );
    return retdata;
  },
};
