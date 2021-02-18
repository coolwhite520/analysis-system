import Default from "./Default";
import dbbase from "../../db/Base";
import Aes from "../aes";
const LinkPathType = {
  link: 1,
  // Token: 0x04000CF6 RID: 3318
  circle: 2,
  // Token: 0x04000CF7 RID: 3319
  endtoend: 3,
  // Token: 0x04000CF8 RID: 3320
  allpath: 4,
  // Token: 0x04000CF9 RID: 3321
  shortestpath: 5,
};
const DataItemType = {
  Detail: 0,
  Sum: 1,
  Diff: 2,
};
const VisualKind = {
  Original: 0,
  // Token: 0x040007A0 RID: 1952
  Custom: 1,
};
const SearchType = {
  kh: 0,
  zjhm: 1,
  mc: 2,
};
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

function CreateProvider(paras) {
  let result;
  if (paras.DataItemType == DataItemType.Detail) {
    result = new DetailDataProvider();
  } else if (paras.DataItemType == DataItemType.Sum) {
    result = new SumDataProvider();
  } else {
    result = new DiffDataProvider();
  }
  result.init(paras);
  return result;
}
async function GetVisualModelData(linkParameters, VisualParameters, Cond) {
  let res;
  let filter = VisualParameters.TradeMoney + "," + VisualParameters.TradeCount;
  if (VisualParameters.VisualType == 0) {
    if (VisualParameters.GroupVisiual) {
      res = await dbbase.GetModelSql(205);
    } else {
      res = await dbbase.GetModelSql(202);
    }
  } else if (linkParameters.VisualType == 1) {
    if (linkParameters.GroupVisiual) {
      res = await dbbase.GetModelSql(206);
    } else {
      res = await dbbase.GetModelSql(204);
    }
  } else if (linkParameters.VisualType == 2) {
    if (linkParameters.GroupVisiual) {
      res = await dbbase.GetModelSql(207);
    } else {
      res = await dbbase.GetModelSql(203);
    }
  }
  let encodesql = res["gpsqltemplate"];
  let orderby = res["orderby"];
  console.log({ linkParameters });
  let sql = GetAnalysisOtherTable(
    Aes.decrypt(encodesql),
    orderby,
    linkParameters.Ajid,
    Cond,
    filter
  );
  if (sql != undefined && sql != null && sql != "") {
    return await dbbase.QueryCustom(sql, linkParameters.Ajid);
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
        Default.GetBankDetailTableSql("ff_bank_records")
      )
      .replace(
        /\$MODEL_FILTER_GROUP_SUM\$/g,
        Default.GetBankDetailTableSumSql("ff_bank_records")
      )
      .replace(/\$AJID\$/g, caseId)
      .replace(/\$ZXJYJE_CONDITION\$/g, "")
      .replace(/\$JYBS_CONDITION\$/g, "")
      .replace(/\$MODEL_FILTER\$/g, condtion)
      .replace(/\$JYZJE\$/g, ">= " + array2[0])
      .replace(/\$ZXJYZCS\$/g, ">= " + array2[1])
      .replace(/\$ZXKPFS\$/g, ">= " + array2[1])
      .replace(/\$JYZCS\$/g, ">= " + array2[1])
      .replace(/\$ZXJSHJ\$/g, ">= " + array2[0])
      .replace(/\$THZSC\$/g, ">= " + array2[1])
      .replace(/\$THZCS\$/g, ">= " + array2[0])
      .replace(/\$MODEL_FILTER_CHILD\$/g, "")
      .replace(/\$SQLORDERBY\$/g, sql_OrderBy);
  } catch (e) {
    return null;
  }
}
function ShowWindowParameter() {
  this.VisualType;
  this.IsHuiZhong = true; //ID7DVySXdb
  this.IsExpand = true; //b7ND1m16cx
  this.TradeCount;
  this.TradeMoney;
  this.IsFenShu;
  this.IsMinXi;
  this.MinPhoneTime;
  this.MinPhoneNum;
  this.GroupVisiual;
  this.VisualKind;
  this.GetParametersDesc = function() {
    let text = "";
    switch (this.VisualType) {
      case 0:
        text += "账号";
        break;
      case 1:
        text += "证件号码";
        break;
      case 2:
        text += "主体名称";
        break;
      case 3:
        text += "税号";
        break;
      case 4:
        text += "公司名称";
        break;
      case 5:
        text += "电话号码";
        break;
    }
    switch (viewType) {
      case 0:
        if (this.IsHuiZhong) {
          text += "-汇总";
        } else {
          text += "-差额";
        }
        if (this.IsExpand) {
          text += "-扩展";
        } else {
          text += "-收缩";
        }
        text += " 上图";
        text = text + "  最小交易次数 = " + this.TradeCount;
        text = text + "  最小交易金额 = " + this.TradeMoney + "元";
        break;
      case 1:
        if (this.IsFenShu) {
          text += "-份数";
        } else {
          text += "-汇总";
        }
        text += " 上图";
        text = text + "  最小交易次数 = " + this.TradeCount;
        text = text + "  最小交易金额 = " + this.TradeMoney + "元";
        break;
      case 2:
        if (this.IsExpand) {
          text += "-扩展";
        } else {
          text += "-收缩";
        }
        text += " 上图";
        text = text + "  最短通话时长 = " + this.MinPhoneTime + "秒";
        text = text + "  最小通话总次数 = " + this.MinPhoneNum;
        break;
    }
    return text;
  };
}
/////????????????????//////////////
function RowData(fx, jyf, dsf, row) {
  this.FX = fx;
  this.FromKey;
  this.ToKey;
  this.FromNode;
  this.ToNode;
  this.Time =
    Default.GetTimeType(row["jysj"]) == Default.DataType.STR
      ? "0001-01-01 00:00:00"
      : row["jysj"];
  this.Money = isNaN(parseFloat(row["jyje"])) ? 0.0 : parseFloat(row["jyje"]);
  this.Count = isNaN(parseInt(row["jybs"])) ? 0 : parseInt(row["jybs"]);
  this.IDS = row["ids"];
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
    return this.FromKeyValue + "->" + ToKeyValue + "," + this.Money;
  };
  this.list_0;
  this.GroupedItems = function() {
    if (this.list_0 == null || this.list_0 == undefined) {
      this.list_0 = new Array();
      this.list_0.push(this);
    }
    return this.list_0;
  };
  this.Group = function(data) {
    this.GroupedItems().push(data);
  };
}
function Node(dat, kh1, zjhm1, mc1) {
  this.data = dat;
  this.kh = kh1;
  this.zjhm = zjhm1;
  this.mc = mc1;
}

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

  this.StartTime = StartTime;
  this.EndTime = EndTime;
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
  this.init = function() {
    this.Condtion = "";
  };
  this.GetLinkParaDesc = function() {
    let text = "";
    if (this == null || this == undefined) {
      return text;
    }
    let text2 = this.CxType;
    if (!Default.IsNullOrEmpty(text2)) {
      if (text2 == "zjhm") {
        text += "类型：交易方证件号";
      } else if (text2 == "mc") {
        text += "类型：交易名称";
      } else {
        text += "类型：交易卡号";
      }
    }
    if (!Default.IsNullOrEmpty(this.Source)) {
      text = text + "   起点：" + this.Source;
    }
    if (
      this.LinkType == LinkPathType.endtoend &&
      !Default.IsNullOrEmpty(this.Target)
    ) {
      text = text + "   终点：" + this.Target;
    }
    text2 = this.Fx;
    if (!Default.IsNullOrEmpty(text2)) {
      if (text2 == "xy") {
        text += "  方向：下游";
      } else {
        text += "  方向：上游";
      }
    }
    text = text + "  间隔(时)：" + this.IntervalTime;
    text = text + "  最小层级-最大层级：" + this.Mindepth + "-" + this.Depth;
    text = text + "  最小交易金额(元)：" + this.MinJyje;
    text = text + "  交易时间范围：" + this.StartTime + "-" + this.EndTime;
    text = text + "  上下层级金额比例：" + this.MinRatio + "-" + this.MaxRatio;
    return text;
  };
}
////////////////////////////BaseDataProvider///////////////////////////////////////////////////////
function BaseDataProvider() {
  this.Paras; //LinkParameters Paras
  this.JYF; //string
  this.DSF; //string
  this.init = function(paras) {
    this.Paras = paras;
    if (this.Paras.CxType == "kh") {
      this.JYF = "cxkh";
      this.DSF = "jydfzkh";
    } else if (this.Paras.CxType == "mc") {
      this.JYF = "jymc";
      this.DSF = "jydfmc";
    } else {
      this.JYF = "jyzjhm";
      this.DSF = "jydfzjhm";
    }
    return;
  };
  this.CreateDataTableSchameInternal = function() {
    return new Array(
      "jdbz",
      "jysj",
      "jyje",
      "cxkh",
      "jymc",
      "jyzjhm",
      "jydfzkh",
      "jydfmc",
      "jydfzjhm",
      "istrue",
      "jybs",
      "ids"
    );
  };
  this.GetDateTimeFilter = function() {
    let text =
      " and " +
      Default.BackFiltrateCondtion_DateTime(
        Default.FiltrateLogicID.NotEmpty,
        this.Paras.StartTime,
        "JYSJ",
        Default.DataType.DATATIME_1
      );
    if (!Default.IsNullOrEmpty(this.Paras.StartTime)) {
      text =
        " and " +
        Default.BackFiltrateCondtion_DateTime(
          Default.FiltrateLogicID.GreaterOrEqual,
          this.Paras.StartTime,
          "JYSJ",
          Default.DataType.DATATIME_1
        );
    }
    if (!Default.IsNullOrEmpty(this.Paras.EndTime)) {
      text =
        text +
        " and " +
        Default.BackFiltrateCondtion_DateTime(
          Default.FiltrateLogicID.LessOrEqual,
          this.Paras.EndTime,
          "JYSJ",
          Default.DataType.DATATIME_1
        );
    }
    return text;
  };
}
function DetailDataProvider() {
  this.base;
  this.init = function(paras) {
    this.base = new BaseDataProvider();
    this.base.init(paras);
  };
  this.GetGroupSqlTemplate = function() {
    return (
      "select shard_id as ids, '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkhgroup else jydfzkhgroup end cxkh, case when jdbz = '出' then jymcgroup else jydfmcgroup end jymc, case WHEN jdbz = '出' THEN jyzjhmgroup ELSE jydfzjhmgroup END jyzjhm, case when jdbz = '出' then jydfzkhgroup else cxkhgroup end jydfzkh, case when jdbz = '出' then jydfmcgroup else jymcgroup end jydfmc, case WHEN jdbz = '出' THEN jydfzjhmgroup ELSE jyzjhmgroup END jydfzjhm from " +
      Default.GetBankDetailTableSumSql("ff_bank_records") +
      " where ajid = " +
      this.base.Paras.Ajid +
      " and jysj is not null $parm2$ $parm2$ $parm4$ ORDER BY jymc"
    ).replace(/\$AJID\$/g, this.base.Paras.Ajid);
  };
  this.GetSqlTemplate = function() {
    return (
      "select shard_id as ids, '出' as jdbz, to_char(jysj::timestamp, 'yyyy-MM-dd HH24:mi:ss') as jysj, jyje,'0' as istrue, case when jdbz = '出' then cxkh else jydfzkh end cxkh, case when jdbz = '出' then jymc else jydfmc end jymc, case WHEN jdbz = '出' THEN jyzjhm ELSE jydfzjhm END jyzjhm, case when jdbz = '出' then jydfzkh else cxkh end jydfzkh, case when jdbz = '出' then jydfmc else jymc end jydfmc, case WHEN jdbz = '出' THEN jydfzjhm ELSE jyzjhm END jydfzjhm from ff_bank_records  where ajid = " +
      this.base.Paras.Ajid +
      " and jysj is not null $parm2$ $parm3$ $parm4$ ORDER BY jymc "
    );
  };
  this.GetDataTableInternal = async function() {
    let arg_E0_0 = this.base.Paras.GroupVisiual
      ? this.GetGroupSqlTemplate()
      : this.GetSqlTemplate();
    let text = "";
    let text2 = "";
    let dateTimeFilter = this.base.GetDateTimeFilter();
    if (this.base.Paras.MinJyje != undefined && this.base.Paras.MinJyje > 0.0) {
      text = "and jyje>=" + this.base.Paras.MinJyje;
    }
    if (this.base.Paras.CxType == "kh") {
      text2 = "and COALESCE(cxkh,'')!='' and COALESCE(jydfzkh,'')!=''";
    } else if (this.base.Paras.CxType == "mc") {
      text2 = "and COALESCE(jymc,'')!='' and COALESCE(jydfmc,'')!=''";
    } else if (this.base.Paras.CxType == "zjhm") {
      text2 = "and COALESCE(jyzjhm,'')!='' and COALESCE(jydfzjhm,'')!=''";
    }
    let sql = arg_E0_0
      .replace(/\$parm2\$/g, dateTimeFilter)
      .replace(/\$parm3\$/g, text)
      .replace(/\$parm4\$/g, text2);
    if (!Default.IsNullOrEmpty(sql)) {
      return await dbbase.QueryCustom(sql, this.base.Paras.Ajid);
    }
  };
  this.DataTableToRowDataInternal = function(dt) {
    let dictionary = {}; //new Default.Dictionary();//{string, RowData}
    for (let i = 0; i < dt.length; i++) {
      let rowData = new RowData(
        this.base.Paras.Fx,
        this.base.JYF,
        this.base.DSF,
        dt[i]
      );
      if (dictionary.hasOwnProperty(rowData.FromKeyValue)) {
        dictionary[rowData.FromKeyValue].Group(rowData);
      } else {
        dictionary[rowData.FromKeyValue] = rowData;
      }
    }
    return dictionary;
  };
}
function BaseSumOrDiffDataProvider() {
  this.base;
  this.init = function(paras) {
    this.base = new BaseDataProvider();
    this.base.init(paras);
  };
  this.CreateShowWindowParameter = function() {
    let showWindowParameter = new ShowWindowParameter();
    if (this.base.Paras.CxType == "kh") {
      showWindowParameter.VisualType = 0;
    } else if (this.base.Paras.CxType == "mc") {
      showWindowParameter.VisualType = 2;
    } else {
      showWindowParameter.VisualType = 1;
    }
    showWindowParameter.GroupVisiual = this.base.Paras.GroupVisiual;
    showWindowParameter.TradeMoney = this.base.Paras.MinJyje;
    showWindowParameter.TradeCount = this.base.Paras.TradeCount;
    return showWindowParameter;
  };
  this.GetDataTableInternal = async function() {
    let visualParameters = this.CreateShowWindowParameter();
    let dateTimeFilter = this.base.GetDateTimeFilter();

    return await GetVisualModelData(
      this.base.Paras,
      visualParameters,
      dateTimeFilter
    );
  };
  this.GetItem = function(dataRow_0, string_2) {
    if (!dataRow_0.hasOwnProperty(string_2)) {
      return "";
    }
    if (dataRow_0[string_2] == null || dataRow_0[string_2] == undefined) {
      return "";
    }
    return dataRow_0[string_2];
  };
  this.SetRowData = function(
    sumordiffDBRow,
    needRevert,
    jyje,
    tradeCount,
    ids
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
      ids: "",
    };
    let array = ["cxkh", "jymc", "jyzjhm"];
    let array2 = ["jydfzkh", "jydfmc", "jydfzjhm"];
    let num = -1;
    if (this.base.Paras.GroupVisiual) {
      if (this.base.Paras.CxType == "kh") {
        num = 0;
      } else if (this.base.Paras.CxType == "mc") {
        num = 1;
      } else {
        num = 2;
      }
    }
    outRow["jyje"] = jyje;
    outRow["jysj"] = "0001-01-01 00:00:00";
    outRow["jybs"] = tradeCount;
    outRow["ids"] = ids;
    for (let i = 0; i < array.length; i++) {
      let text = needRevert ? array2[i] : array[i];
      if (i == num) {
        text += "group";
      }
      outRow[array[i]] = this.GetItem(sumordiffDBRow, text);
    }
    for (let j = 0; j < array2.length; j++) {
      let text2 = needRevert ? array[j] : array2[j];
      if (j == num) {
        text2 += "group";
      }
      outRow[array2[j]] = this.GetItem(sumordiffDBRow, text2);
    }
    return outRow;
  };
}

function SumDataProvider() {
  this.base;
  this.init = function(paras) {
    this.base = new BaseSumOrDiffDataProvider();
    this.base.init(paras);
  };
  this.CreateShowWindowParameter = function() {
    let expr_06 = this.base.CreateShowWindowParameter();
    expr_06.IsHuiZhong = true;
    return expr_06;
  };
  this.GetDataTableInternal = async function() {
    return await this.base.GetDataTableInternal();
  };
  this.DataTableToRowDataInternal = function(dt) {
    let dictionary = {}; //new Default.Dictionary();//{string, RowData}
    for (let i = 0; i < dt.length; i++) {
      let dataRow = dt[i];
      let list = [];
      let valueOrDefault = parseFloat(dataRow["czje"]);
      let valueOrDefault2 = parseFloat(dataRow["jzje"]);
      let ids = "";
      if (!isNaN(valueOrDefault) && valueOrDefault != 0.0) {
        ids = dataRow["cids"];
        let dataRow2 = this.base.SetRowData(
          dataRow,
          false,
          valueOrDefault,
          parseInt(dataRow["czbs"]),
          ids
        );
        list.push(dataRow2);
      }
      if (!isNaN(valueOrDefault2) && valueOrDefault2 != 0.0) {
        ids = dataRow["jids"];
        let dataRow3 = this.base.SetRowData(
          dataRow,
          true,
          valueOrDefault2,
          parseInt(dataRow["jzbs"]),
          ids
        );
        list.push(dataRow3);
      }
      for (let i = 0; i < list.length; i++) {
        let rowData = new RowData(
          this.base.base.Paras.Fx,
          this.base.base.JYF,
          this.base.base.DSF,
          list[i]
        );
        if (dictionary.hasOwnProperty(rowData.FromKeyValue)) {
          dictionary[rowData.FromKeyValue].Group(rowData);
        } else {
          dictionary[rowData.FromKeyValue] = rowData;
        }
      }
    }
    return dictionary;
  };
}
function DiffDataProvider() {
  this.base;
  this.init = function(paras) {
    this.base = new BaseSumOrDiffDataProvider();
    this.base.init(paras);
  };
  this.CreateShowWindowParameter = function() {
    let expr_06 = this.base.CreateShowWindowParameter();
    expr_06.IsHuiZhong = false;
    return expr_06;
  };
  this.GetDataTableInternal = async function() {
    return await this.base.GetDataTableInternal();
  };
  this.DataTableToRowDataInternal = function(dt) {
    let dictionary = {}; //new Default.Dictionary();//{string, RowData}
    for (let i = 0; i < dt.length; i++) {
      let dataRow = dt[i];
      let valueOrDefault = parseFloat(dataRow["jczce"]);
      if (!isNaN(valueOrDefault) && valueOrDefault != 0.0) {
        let valueOrDefault2 = parseInt(dataRow["czbs"]);
        let valueOrDefault3 = parseInt(dataRow["jzbs"]);
        let text = dataRow["cids"];
        if (Default.IsNullOrEmpty(text)) {
          text += dataRow["jids"];
        } else {
          text += Default.IsNullOrEmpty(dataRow["jids"])
            ? ""
            : "," + dataRow["jids"];
        }
        let dataRow2 = this.base.SetRowData(
          dataRow,
          valueOrDefault > 0.0,
          Math.abs(valueOrDefault),
          Math.abs(valueOrDefault2 + valueOrDefault3),
          text
        );
        let rowData = new RowData(
          this.base.base.Paras.Fx,
          this.base.base.JYF,
          this.base.base.DSF,
          dataRow2
        );
        if (dictionary.hasOwnProperty(rowData.FromKeyValue)) {
          dictionary[rowData.FromKeyValue].Group(rowData);
        } else {
          dictionary[rowData.FromKeyValue] = rowData;
        }
      }
    }
    return dictionary;
  };
}
function BasePathFinder(paras) {
  this.Paras = paras;
  this.Run = function(dt) {
    let source = this.Paras.Source;
    return this.method_0(source, dt);
  };
  this.method_0 = function(string_0, dictionary_0) {
    let vclass;
    if (this.Paras.LinkType == LinkPathType.link) {
      vclass = new Class7(string_0, dictionary_0, this.Paras);
    } else {
      vclass = new Class6(string_0, dictionary_0, this.Paras);
    }
    return vclass.vmethod_0();
  };
}
////////////////////////////internal class Class5///////////////////////////////////////////////////////
function NodeModelCollection() {
  this.Items = {};
  this.Count = function() {
    return Object.keys(this.Items).length;
  };
  this.Add = function(node) {
    //NodeModel.UniqueKey属性
    if (!this.Items.hasOwnProperty(node.getUniqueKey())) {
      this.Items[node.getUniqueKey()] = node;
    }
  };
  this.ContainsKey = function(key) {
    return this.Items.hasOwnProperty(key);
  };
}
function LinkModelCollection() {
  this.Items = {};
  this.Count = function() {
    return Object.keys(this.Items).length;
  };
  this.Add = function(link) {
    if (!this.Items.hasOwnProperty(link.getUniqueKey())) {
      this.Items[link.getUniqueKey()] = link;
    }
  };
  this.Remove = function(link) {
    if (this.Items.hasOwnProperty(link.getUniqueKey())) {
      delete Items[link.getUniqueKey()];
    }
  };
  this.ContainsKey = function(key) {
    return this.Items.hasOwnProperty(key);
  };
  this.Set = function(validLinks) {
    this.Items = validLinks;
  };
}

function Class5() {
  this.linkParameters_0;
  this.nodeModelCollection_0;
  this.linkModelCollection_0;
  this.dictionary_0;
  this.Root;
  this.init = function(string_0, dictionary_1, linkParameters_1) {
    this.nodeModelCollection_0 = new NodeModelCollection();
    this.linkModelCollection_0 = new LinkModelCollection();
    this.method_1(linkParameters_1);
    this.dictionary_0 = dictionary_1;
  };
  this.method_0 = function() {
    return this.linkParameters_0;
  };
  this.method_1 = function(linkParameters_1) {
    this.linkParameters_0 = linkParameters_1;
  };
  this.method_2 = function(nodeModel_1) {
    this.nodeModelCollection_0.Add(nodeModel_1);
  };
  this.method_3 = function(rowData_0) {
    let fromKeyValue = rowData_0.FromKeyValue;
    let nodeModel;
    if (this.nodeModelCollection_0.ContainsKey(fromKeyValue)) {
      nodeModel = this.nodeModelCollection_0.Items[fromKeyValue];
    } else {
      nodeModel = new NodeModel();
      nodeModel.CardNo = rowData_0.FromNode.kh;
      nodeModel.Username = rowData_0.FromNode.mc;
      nodeModel.IdentityNo = rowData_0.FromNode.zjhm;
      nodeModel.FieldName = rowData_0.FromKey;
      nodeModel.UniqueKey = rowData_0.FromKeyValue;
    }
    return nodeModel;
  };
  this.method_4 = function(nodeModel_1, rowData_0) {
    let toKeyValue = rowData_0.ToKeyValue;
    let nodeModel;
    if (this.nodeModelCollection_0.ContainsKey(toKeyValue)) {
      nodeModel = this.nodeModelCollection_0.Items[toKeyValue];
    } else {
      nodeModel = new NodeModel();
      nodeModel.CardNo = rowData_0.ToNode.kh;
      nodeModel.Username = rowData_0.ToNode.mc;
      nodeModel.IdentityNo = rowData_0.ToNode.zjhm;
      nodeModel.FieldName = rowData_0.ToKey;
      nodeModel.UniqueKey = rowData_0.ToKeyValue;
    }
    return nodeModel;
  };
  this.method_5 = function(string_0) {
    return this.linkModelCollection_0.ContainsKey(string_0);
  };
  this.method_6 = function(linkModel_0) {
    return this.linkModelCollection_0.ContainsKey(linkModel_0.getUniqueKey());
  };
  this.method_7 = function(linkModel_0) {
    let arg_0D_0 = linkModel_0.From;
    let to = linkModel_0.To;
    arg_0D_0.OutLinks.Add(linkModel_0);
    to.InLinks.Add(linkModel_0);
    this.linkModelCollection_0.Add(linkModel_0);
  };
  this.method_8 = function(linkModel_0) {
    if (linkModel_0.From != undefined && linkModel_0.From != null) {
      linkModel_0.From.OutLinks.Remove(linkModel_0);
    }
    if (linkModel_0.To != undefined && linkModel_0.To != null) {
      linkModel_0.To.InLinks.Remove(linkModel_0);
    }
    this.linkModelCollection_0.Remove(linkModel_0);
  };
  this.method_9 = function(nodeModel_1, linkModel_0) {
    let arg_1C_0 = this.dictionary_0[nodeModel_1.getUniqueKey()].GroupedItems();
    let list = [];
    for (let i = 0; i < arg_1C_0.length; i++) {
      let current = arg_1C_0[i];
      let text = LinkModel_CreateKey(
        this.linkParameters_0,
        nodeModel_1.getUniqueKey(),
        current.ToKeyValue,
        current.Time,
        current.Money
      );
      if (this.method_5(text)) {
        list.push(this.linkModelCollection_0.Items[text]);
      } else {
        let linkModel = new LinkModel(this.linkParameters_0);
        linkModel.From = nodeModel_1;
        linkModel.To = this.method_4(nodeModel_1, current);
        linkModel.TradeMoney = current.Money;
        linkModel.TradeTime = current.Time;
        linkModel.TradeCount = current.Count;
        linkModel.IDS = current.IDS;
        linkModel.UniqueKey = text;
        let flag =
          linkModel_0 == undefined ||
          linkModel_0 == null ||
          this.NajXrfOjp8(linkModel_0, linkModel, false);
        if (flag) {
          this.method_2(linkModel.To);
          this.method_7(linkModel);
          list.push(linkModel);
        }
      }
    }
    return list;
  };
  this.NajXrfOjp8 = function(linkModel_0, linkModel_1, bool_0 = false) {
    if (this.linkParameters_0.DataItemType != DataItemType.Detail) {
      return true;
    }
    if (this.linkParameters_0.IntervalTime > 0) {
      let timeSpan = this.linkParameters_0.IsDownDirection
        ? dateDiff(linkModel_1.TradeTime, linkModel_0.TradeTime)
        : dateDiff(linkModel_0.TradeTime, linkModel_1.TradeTime);
      let TotalHours = timeSpan / 3600;
      if (TotalHours < 0.0 || TotalHours > this.linkParameters_0.IntervalTime) {
        return false;
      }
    }
    let tradeMoney;
    let tradeMoney2;
    if (this.linkParameters_0.IsDownDirection) {
      tradeMoney = linkModel_0.TradeMoney;
      tradeMoney2 = linkModel_1.TradeMoney;
    } else {
      tradeMoney = linkModel_0.TradeMoney;
      tradeMoney2 = linkModel_1.TradeMoney;
    }
    return (
      (this.linkParameters_0.MinRatio <= 0.0 ||
        tradeMoney / tradeMoney2 >= this.linkParameters_0.MinRatio) &&
      (this.linkParameters_0.MaxRatio <= 0.0 ||
        tradeMoney / tradeMoney2 <= this.linkParameters_0.MaxRatio)
    );
  };
  this.method_10 = function() {
    if (this.linkParameters_0.Mindepth == 0) {
      return;
    }
    let arg_14_0 = this.Root;
    for (let i in this.linkModelCollection_0.Items) {
      let linkModel = this.linkModelCollection_0.Items[i];
      if (
        linkModel.IsMinDepthValid != undefined &&
        linkModel.IsMinDepthValid != null &&
        !linkModel.IsMinDepthValid
      ) {
        this.method_8(linkModel);
      }
    }
  };
  //?????????getUniqueKey,ToString?????????
  this.method_11 = function(stack_0, dictionary_1) {
    if (stack_0.size() >= this.linkParameters_0.Mindepth) {
      this.method_12(stack_0.peek(), dictionary_1);
      for (let i = 0; i < stack_0.size(); ++i) {
        let current = stack_0.data[i];
        if (!dictionary_1.hasOwnProperty(current.getUniqueKey())) {
          current.IsMinDepthValid = true;
          dictionary_1[current.getUniqueKey()] = current;
        }
      }
      return true;
    }
    let to = stack_0.data[0].To;
    if (!to.IsRoot && to.OutLinks.Count() != 0) {
      let flag = false;
      for (let i in to.OutLinks.Items) {
        let item = to.OutLinks.Items[i];
        if (
          stack_0.data.findIndex(
            (node) => node.getUniqueKey() == item.getUniqueKey()
          ) < 0
        ) {
          //getUniqueKey??????????
          stack_0.push(item);
          let flag2 = this.method_11(stack_0, dictionary_1);
          stack_0.pop();
          flag |= flag2;
        }
      }
      return flag;
    }
    return false;
  };
  this.method_12 = function(linkModel_0, dictionary_1) {
    if (dictionary_1.hasOwnProperty(linkModel_0.getUniqueKey())) {
      return;
    }
    linkModel_0.IsMinDepthValid = true;
    dictionary_1[linkModel_0.getUniqueKey()] = linkModel_0;
    let to = linkModel_0.To;
    if (to.IsRoot) {
      return;
    }
    for (let i in to.OutLinks.Items) {
      let linkModel_ = to.OutLinks.Items[i];
      this.method_12(linkModel_, dictionary_1);
    }
  };
  //vmethod virtual
  this.vmethod_0 = function() {
    this.vmethod_1();
    return this.vmethod_3();
  };
  this.vmethod_1 = function() {};
  this.vmethod_2 = function(linkModel_0) {
    return linkModel_0.IsMinDepthValid == undefined
      ? false
      : linkModel_0.IsMinDepthValid;
  };
  this.vmethod_3 = function() {
    let dictionary = {}; //string,NodeModel
    let dictionary2 = {}; //string,LinkModel
    for (let i in this.linkModelCollection_0.Items) {
      let value = this.linkModelCollection_0.Items[i];
      if (this.vmethod_2(value)) {
        if (!dictionary2.hasOwnProperty(value.getUniqueKey())) {
          dictionary2[value.getUniqueKey()] = value;
        }
        if (!dictionary.hasOwnProperty(value.From.getUniqueKey())) {
          dictionary[value.From.getUniqueKey()] = value.From;
        }
        if (!dictionary.hasOwnProperty(value.To.getUniqueKey())) {
          dictionary[value.To.getUniqueKey()] = value.To;
        }
      }
    }
    return { Nodedictionary: dictionary, Linkdictionary: dictionary2 };
  };
}

////////////////////////////childclass Class7///////////////////////////////////////////////////////
function Class7(string_0, dictionary_1, linkParameters_1) {
  this.base = new Class5();
  this.base.init(string_0, dictionary_1, linkParameters_1);
  this.vmethod_0 = function() {
    this.vmethod_1();
    this.method_15();
    return this.vmethod_3();
  };
  this.vmethod_1 = function() {
    this.method_13(this.base.linkParameters_0.Source);
  };
  this.method_13 = function(string_0) {
    if (!this.base.dictionary_0.hasOwnProperty(string_0)) {
      return;
    }
    let nodeModel = this.base.method_3(this.base.dictionary_0[string_0]);
    nodeModel.IsRoot = true;
    this.base.Root = nodeModel;
    this.base.method_2(nodeModel);
    let stack_ = new Default.Stack();
    let hashSet_ = []; //LinkModel.UniqueKey
    this.method_14(nodeModel, stack_, hashSet_);
  };
  this.method_14 = function(nodeModel_1, stack_0, hashSet_0) {
    let count = stack_0.size();
    if (count > 0 && nodeModel_1.IsRoot) {
      return;
    }
    if (
      this.base.linkParameters_0.Depth > 0 &&
      count >= this.base.linkParameters_0.Depth
    ) {
      return;
    }
    if (!this.base.dictionary_0.hasOwnProperty(nodeModel_1.getUniqueKey())) {
      return;
    }
    let linkModel_ = count == 0 ? null : stack_0.peek();
    let m17_res = this.method_17(nodeModel_1, linkModel_);
    for (let i = 0; i < m17_res.length; ++i) {
      let current = m17_res[i];
      if (!hashSet_0.includes(current.getUniqueKey())) {
        hashSet_0.push(current.getUniqueKey());
        let to = current.To;
        stack_0.push(current);
        this.method_14(to, stack_0, hashSet_0);
        stack_0.pop();
        let index = hashSet_0.indexOf(current.getUniqueKey());
        if (index >= 0) {
          hashSet_0.splice(index, 1);
        }
      }
    }
  };
  this.method_15 = function() {
    if (this.base.Root == undefined || this.base.Root == null) {
      return;
    }
    let stack = new Default.Stack(); //NodeModel
    stack.push(this.base.Root);
    this.method_16(this.base.Root, stack);
    stack.pop();
  };
  this.method_16 = function(nodeModel_1, stack_0) {
    let num = stack_0.size() - 1;
    if (num > 0 && nodeModel_1.IsRoot) {
      if (
        num >= this.base.linkParameters_0.Mindepth &&
        num <= this.base.linkParameters_0.Depth
      ) {
        for (let i = 0; i < stack_0.size(); i++) {
          stack_0.data[i].IsMinDepth = true;
        }
      }
      return;
    }
    if (num >= this.base.linkParameters_0.Depth) {
      for (let i = 0; i < stack_0.size(); i++) {
        stack_0.data[i].IsMinDepth = true;
      }
      return;
    }
    if (nodeModel_1.OutLinks.Count() == 0) {
      if (num >= this.base.linkParameters_0.Mindepth) {
        for (let i = 0; i < stack_0.size(); i++) {
          stack_0.data[i].IsMinDepth = true;
        }
      }
      return;
    }
    let hashSet = {}; //NodeModel
    for (let i in nodeModel_1.OutLinks.Items) {
      let current = nodeModel_1.OutLinks.Items[i];
      hashSet[current.To.getUniqueKey()] = current.To;
    }
    for (let i in hashSet) {
      let current2 = hashSet[i];
      if (
        stack_0.data.findIndex(
          (node) => node.getUniqueKey() == current2.getUniqueKey()
        ) < 0
      ) {
        stack_0.push(current2);
        this.method_16(current2, stack_0);
        stack_0.pop();
      }
    }
  };
  this.method_17 = function(nodeModel_1, linkModel_0) {
    let arg_1C_0 = this.base.dictionary_0[
      nodeModel_1.getUniqueKey()
    ].GroupedItems();
    let list = [];
    for (let i = 0; i < arg_1C_0.length; i++) {
      let current = arg_1C_0[i];
      let text = LinkModel_CreateKey(
        this.base.linkParameters_0,
        nodeModel_1.getUniqueKey(),
        current.ToKeyValue,
        current.Time,
        current.Money
      );
      if (!this.base.method_5(text)) {
        let linkModel = new LinkModel(this.base.linkParameters_0);
        linkModel.From = nodeModel_1;
        linkModel.To = this.base.method_4(nodeModel_1, current);
        linkModel.TradeMoney = current.Money;
        linkModel.TradeTime = current.Time;
        linkModel.TradeCount = current.Count;
        linkModel.IDS = current.IDS;
        linkModel.UniqueKey = text;
        let flag =
          linkModel_0 == undefined ||
          linkModel_0 == null ||
          this.base.NajXrfOjp8(linkModel_0, linkModel, false);
        if (flag) {
          this.base.method_2(linkModel.To);
          this.base.method_7(linkModel);
          list.push(linkModel);
        }
      }
    }
    return list;
  };
  this.vmethod_3 = function() {
    let dictionary = {}; //string,NodeModel
    let dictionary2 = {}; //string,LinkModel
    let dictionary3 = {}; //string,LinkModel
    for (let i in this.base.nodeModelCollection_0.Items) {
      let value = this.base.nodeModelCollection_0.Items[i];
      if (
        value.IsMinDepth != undefined &&
        value.IsMinDepth != null &&
        value.IsMinDepth
      ) {
        if (!dictionary.hasOwnProperty(value.getUniqueKey())) {
          dictionary[value.getUniqueKey()] = value;
        }
        for (let j in value.InLinks.Items) {
          if (!dictionary3.hasOwnProperty(j)) {
            dictionary3[j] = value.InLinks.Items[j];
          }
        }
        for (let k in value.OutLinks.Items) {
          if (!dictionary3.hasOwnProperty(k)) {
            dictionary3[k] = value.OutLinks.Items[k];
          }
        }
      }
    }
    for (let i in dictionary3) {
      if (!dictionary2.hasOwnProperty(i)) {
        let value2 = dictionary3[i];
        if (
          dictionary.hasOwnProperty(value2.From.getUniqueKey()) &&
          dictionary.hasOwnProperty(value2.To.getUniqueKey())
        ) {
          dictionary2[value2.getUniqueKey()] = value2;
        }
      }
    }
    return { Nodedictionary: dictionary, Linkdictionary: dictionary2 };
  };
}

////////////////////////////childclass Class6///////////////////////////////////////////////////////
function Class6(string_0, dictionary_1, linkParameters_1) {
  this.base = new Class5();
  this.base.init(string_0, dictionary_1, linkParameters_1);
  this.vmethod_0 = function() {
    this.vmethod_1(); //GenerateNetwork
    this.method_15(); //CheckMinDepth
    return this.vmethod_3(); //GenerateResultData
  };
  this.vmethod_1 = function() {
    this.method_13(this.base.linkParameters_0.Source);
  };
  this.method_13 = function(string_0) {
    if (!this.base.dictionary_0.hasOwnProperty(string_0)) {
      return;
    }
    let nodeModel = this.base.method_3(this.base.dictionary_0[string_0]);
    nodeModel.IsRoot = true;
    this.base.Root = nodeModel;
    this.base.method_2(nodeModel);
    let stack_ = new Default.Stack();
    let hashSet_ = []; //LinkModel.UniqueKey
    let string_ =
      this.base.linkParameters_0.LinkType == LinkPathType.circle
        ? string_0
        : this.base.linkParameters_0.Target;
    this.method_14(nodeModel, string_, stack_, hashSet_);
  };
  this.method_14 = function(nodeModel_1, string_0, stack_0, hashSet_0) {
    let count = stack_0.size();
    if (count > 0) {
      if (nodeModel_1.getUniqueKey() == string_0) {
        if (
          count >= this.base.linkParameters_0.Mindepth &&
          count <= this.base.linkParameters_0.Depth
        ) {
          for (let i = 0; i < count; i++) {
            let expr_49 = stack_0.data[i];
            expr_49.From.IsToTarget = true;
            expr_49.To.IsToTarget = true;
            expr_49.IsTargetValid = true;
          }
        }
        return;
      }
      if (nodeModel_1.IsRoot) {
        return;
      }
    }
    if (
      this.base.linkParameters_0.Depth > 0 &&
      count >= this.base.linkParameters_0.Depth
    ) {
      return;
    }
    if (!this.base.dictionary_0.hasOwnProperty(nodeModel_1.getUniqueKey())) {
      return;
    }
    let linkModel_ = count == 0 ? null : stack_0.peek();
    let m18_res = this.method_18(nodeModel_1, linkModel_);
    for (let i = 0; i < m18_res.length; ++i) {
      let current = m18_res[i];
      if (!hashSet_0.includes(current.getUniqueKey())) {
        hashSet_0.push(current.getUniqueKey());
        let to = current.To;
        stack_0.push(current);
        this.method_14(to, string_0, stack_0, hashSet_0);
        stack_0.pop();
        let index = hashSet_0.indexOf(current.getUniqueKey());
        if (index >= 0) {
          hashSet_0.splice(index, 1);
        }
      }
    }
  };
  this.method_15 = function() {
    if (this.base.Root == undefined || this.base.Root == null) {
      return;
    }
    let stack = new Default.Stack();
    stack.push(this.base.Root);
    this.method_17(this.base.Root, stack);
    stack.pop();
  };
  this.method_16 = function(string_0, string_1) {
    let arg_1F_0 = this.base.nodeModelCollection_0.Items[string_0];
    let nodeModel = this.base.nodeModelCollection_0[string_1];
    let list = [];
    for (let i in arg_1F_0.OutLinks.Items) {
      if (nodeModel.InLinks.ContainsKey(i)) {
        list.push(arg_1F_0.OutLinks.Items[i]);
      }
    }
    return list;
  };
  this.method_17 = function(nodeModel_1, stack_0) {
    let num = stack_0.size() - 1;
    if (num > 0 && nodeModel_1.IsRoot) {
      if (
        num >= this.base.linkParameters_0.Mindepth &&
        num <= this.base.linkParameters_0.Depth
      ) {
        for (let i = 0; i < stack_0.size(); i++) {
          stack_0.data[i].IsMinDepth = true;
        }
      }
      return;
    }
    if (num >= this.base.linkParameters_0.Depth) {
      for (let i = 0; i < stack_0.size(); i++) {
        stack_0.data[i].IsMinDepth = true;
      }
      return;
    }
    if (nodeModel_1.OutLinks.Count() == 0) {
      if (num >= this.base.linkParameters_0.Mindepth) {
        for (let i = 0; i < stack_0.size(); i++) {
          stack_0.data[i].IsMinDepth = true;
        }
      }
      return;
    }
    let hashSet = {}; //NodeModel
    for (let i in nodeModel_1.OutLinks.Items) {
      let current = nodeModel_1.OutLinks.Items[i];
      if (
        current.IsTargetValid != undefined &&
        current.IsTargetValid != null &&
        current.IsTargetValid
      ) {
        hashSet[current.To.getUniqueKey()] = current.To;
      }
    }
    for (let i in hashSet) {
      let current2 = hashSet[i];
      if (current2.IsRoot) {
        if (
          num < this.base.linkParameters_0.Mindepth ||
          num > this.base.linkParameters_0.Depth
        ) {
          continue;
        }
        for (let j = 0; j < stack_0.size(); j++) {
          stack_0.data[j].IsMinDepth = true;
        }
        continue;
      }
      if (
        stack_0.data.findIndex(
          (node) => node.getUniqueKey() == current2.getUniqueKey()
        ) < 0
      ) {
        stack_0.push(current2);
        this.method_17(current2, stack_0);
        stack_0.pop();
      }
    }
  };
  this.method_18 = function(nodeModel_1, linkModel_0) {
    let arg_1C_0 = this.base.dictionary_0[
      nodeModel_1.getUniqueKey()
    ].GroupedItems();
    let list = [];
    for (let i = 0; i < arg_1C_0.length; i++) {
      let current = arg_1C_0[i];
      let text = LinkModel_CreateKey(
        this.base.linkParameters_0,
        nodeModel_1.getUniqueKey(),
        current.ToKeyValue,
        current.Time,
        current.Money
      );
      if (!this.base.method_5(text)) {
        let linkModel = new LinkModel(this.base.linkParameters_0);
        linkModel.From = nodeModel_1;
        linkModel.To = this.base.method_4(nodeModel_1, current);
        linkModel.TradeMoney = current.Money;
        linkModel.TradeTime = current.Time;
        linkModel.TradeCount = current.Count;
        linkModel.IDS = current.IDS;
        linkModel.UniqueKey = text;
        let flag =
          linkModel_0 == undefined ||
          linkModel_0 == null ||
          this.base.NajXrfOjp8(linkModel_0, linkModel, false);
        if (flag) {
          this.base.method_2(linkModel.To);
          this.base.method_7(linkModel);
          list.push(linkModel);
        }
      }
    }
    return list;
  };
  this.vmethod_3 = function() {
    let dictionary = {}; //NodeModel
    let dictionary2 = {}; //LinkModel
    let dictionary3 = {}; //LinkModel
    for (let i in this.base.nodeModelCollection_0.Items) {
      let value = this.base.nodeModelCollection_0.Items[i];
      if (
        value.IsMinDepth != undefined &&
        value.IsMinDepth != null &&
        value.IsMinDepth &&
        value.IsToTarget != undefined &&
        value.IsToTarget != null &&
        value.IsToTarget
      ) {
        if (!dictionary.hasOwnProperty(value.getUniqueKey())) {
          dictionary[value.getUniqueKey()] = value;
        }
        for (let j in value.InLinks.Items) {
          let current2 = value.InLinks.Items[j];
          if (
            current2.IsTargetValid != undefined &&
            current2.IsTargetValid != null &&
            current2.IsTargetValid &&
            !dictionary3.hasOwnProperty(j)
          ) {
            dictionary3[j] = current2;
          }
        }
        for (let k in value.OutLinks.Items) {
          let current3 = value.OutLinks.Items[k];
          if (
            current3.IsTargetValid != undefined &&
            current3.IsTargetValid != null &&
            current3.IsTargetValid &&
            !dictionary3.hasOwnProperty(k)
          ) {
            dictionary3[k] = current3;
          }
        }
      }
    }
    for (let i in dictionary3) {
      if (!dictionary2.hasOwnProperty(i)) {
        let value2 = dictionary3[i];
        if (
          dictionary.hasOwnProperty(value2.From.getUniqueKey()) &&
          dictionary.hasOwnProperty(value2.To.getUniqueKey())
        ) {
          dictionary2[value2.getUniqueKey()] = value2;
        }
      }
    }
    return { Nodedictionary: dictionary, Linkdictionary: dictionary2 };
  };
}
////////////////////////////childclass Class6///////////////////////////////////////////////////////
////////////////////////////FindLinkPathView///////////////////////////////////////////////
function FindLinkPathView(pathType, ends) {
  this.PathParams = new FindLinkPathParams(); //this.findLinkPathParams_0;

  this.method_0 = function(linkPathType_0, string_0) {
    let list = [];
    this.PathParams.PathType = linkPathType_0;
    switch (linkPathType_0) {
      case LinkPathType.link:
        if (string_0.length == 0) {
          list.concat(2, 4);
        } else {
          list.concat(0, 3, 4);
          this.PathParams.FromEnd = string_0[0];
        }
        break;
      case LinkPathType.circle:
        if (string_0.length == 0) {
          list.concat(2, 4);
        } else {
          list.concat(0, 2, 4);
          this.PathParams.FromEnd = string_0[0];
        }
        break;
      case LinkPathType.allpath:
      case LinkPathType.shortestpath:
        list.concat(0, 1, 2);
        this.PathParams.FromEnd = string_0[0];
        this.PathParams.ToEnd = string_0[1];
        break;
    }
  };

  this.method_0(pathType, ends);
}
////////////////////////////FindLinkPathParams///////////////////////////////////////////////
function FindLinkPathParams() {
  this.FromEnd = ""; //string_0
  this.ToEnd = ""; //this.string_1;
  this.IsArrow = true; //this.bool_0;
  this.IsToEnd = true; //this.bool_1;
  this.MinDepth = 2; //this.int_0;
  this.MaxDepth = 6; //this.int_1;
  this.PathType; //this.linkPathType_0;
}

function LinkModel_CreateKey(Paras, fromKey, toKey, tradeTime, tradeMoney) {
  let result = "";

  if (Paras.DataItemType == DataItemType.Detail) {
    result = fromKey + "_" + toKey + "_" + tradeTime;
  } else if (
    Paras.DataItemType == DataItemType.Diff ||
    Paras.DataItemType == DataItemType.Sum
  ) {
    result = fromKey + "_" + toKey;
  }
  return result;
}

////////////////////////////NodeModel///////////////////////////////////////////////
function NodeModel() {
  this.IsToTarget;
  this.IsMinDepth;
  this.UniqueKey;
  this.getUniqueKey = function() {
    return this.UniqueKey;
  };
  this.FieldName;
  this.CardNo;
  this.Username;
  this.IdentityNo;
  this.InLinks = new LinkModelCollection();
  this.OutLinks = new LinkModelCollection();
  this.IsCutted = false;
  this.IsRoot = false;
  this.ToString = function() {
    return this.UniqueKey + "(" + this.Username + ")";
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
  //this.Copy=function(){
  //}
}
////////////////////////////LinkModel///////////////////////////////////////////////////////
function LinkModel(linkParameters) {
  this.IDS;
  this.From;
  this.To;
  this.TradeMoney;
  this.TradeTime;
  this.TradeCount;
  this.UniqueKey;
  this.linkParameters_0 = linkParameters;
  this.method_0 = function() {
    this.UniqueKey = LinkModel_CreateKey(
      this.linkParameters_0,
      this.From.getUniqueKey(),
      this.To.getUniqueKey(),
      this.TradeTime,
      this.TradeMoney
    );
  };

  this.getUniqueKey = function() {
    if (Default.IsNullOrEmpty(this.UniqueKey)) {
      this.method_0();
    }
    return this.UniqueKey;
  };
  this.ToString = function() {
    return (
      this.From.ToString() +
      "->" +
      this.To.ToString() +
      this.dataTime() +
      " " +
      this.TradeMoney
    );
  };
  this.fromId = function() {
    return this.From.UniqueKey;
  };
  this.toId = function() {
    return this.To.UniqueKey;
  };
  this.dataTime = function() {
    if (this.linkParameters_0.DataItemType == DataItemType.Detail) {
      return this.TradeTime;
    }
    return this.TradeCount + "笔交易";
  };
}
async function StartComputeInternal(Paras, IsMocking = false) {
  let baseDataProvider = CreateProvider(Paras);
  console.log(baseDataProvider);
  //if (IsMocking){
  //    MockDataProvider.CreateMockLinkParameters();
  //	dt = MockDataProvider.CreateMockDataTable();
  //}else{dt = baseDataProvider.GetDataTableInternal();}
  let dt = await baseDataProvider.GetDataTableInternal();
  let dt2 = baseDataProvider.DataTableToRowDataInternal(dt.rows); //Dictionary<string, RowData>
  //console.log( Object.keys(dt.rows).length,Object.keys(dt2).length )

  let basePathFinder = new BasePathFinder(Paras);
  let res = basePathFinder.Run(dt2);

  console.log(
    Object.keys(res.Nodedictionary).length,
    Object.keys(res.Linkdictionary).length
  );

  let links = [];
  let nodes = [];
  for (let key in res.Nodedictionary) {
    let current = res.Nodedictionary[key];
    nodes.push({
      CardNo: key,
      FieldName: current.FieldName,
      IdentityNo: current.IdentityNo,
      IsRoot: current.IsRoot,
      UniqueKey: current.UniqueKey,
      Username: current.Username,
    });
    //console.log(key)
  }
  for (let key in res.Linkdictionary) {
    let current = res.Linkdictionary[key];
    links.push({
      dataType: Paras.DataItemType,
      source: current.From.UniqueKey,
      target: current.To.UniqueKey,
      tradeMoney: current.TradeMoney,
      tradeTime: current.TradeTime,
      tradeCount: current.TradeCount,
    });
    //console.log(res.Linkdictionary[key].ToString())
  }
  return { links, nodes };
}

export default {
  /**
   *
   *
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
    let retdata = await StartComputeInternal(linkParameters);
    return retdata;
  },
};
