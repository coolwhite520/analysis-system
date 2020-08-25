let Default = require("./Default");

function BackFiltrateCondtion(
  condtion,
  vale,
  FiltrateFieldEN,
  DataType_ = Default.DataType.STR
) {
  let text = "";
  let flag = false;
  let array = [];

  if (!Default.IsNullOrEmpty(vale)) {
    let array2 = vale.replace(/：/g, ":").split(":");
    for (let i = 0; i < array2.length; i++) {
      if (array2[i] != "") {
        array.push(array2[i]);
      } else {
        flag = true;
      }
    }
  }

  if (
    condtion == Default.FiltrateLogicID.GreaterOrEqual &&
    array != null &&
    array.length != 0
  ) {
    for (let i = 0; i < array.length; i++) {
      text = text + " " + FiltrateFieldEN + " >= '" + array[i] + "' ";
      if (i < array.length - 1) {
        j;
        text += " OR ";
      }
    }
  } else if (
    condtion == Default.FiltrateLogicID.GreaterThan &&
    array != null &&
    array.length != 0
  ) {
    for (let j = 0; j < array.length; j++) {
      text = text + " " + FiltrateFieldEN + " > '" + array[j] + "' ";
      if (j < array.length - 1) {
        text += " OR ";
      }
    }
  } else if (
    condtion == Default.FiltrateLogicID.LessThan &&
    array != null &&
    array.length != 0
  ) {
    for (let k = 0; k < array.length; k++) {
      text = text + " " + FiltrateFieldEN + " < '" + array[k] + "' ";
      if (k < array.length - 1) {
        text += " OR ";
      }
    }
  } else if (condtion == Default.FiltrateLogicID.NotEmpty) {
    if (DataType_ == Default.DataType.STR) {
      text =
        " " +
        FiltrateFieldEN +
        " IS NOT NULL AND (LENGTH( COALESCE(" +
        FiltrateFieldEN +
        ", '0'))>0)";
    } else {
      text = " " + FiltrateFieldEN + " is not null ";
    }
  } else if (condtion == Default.FiltrateLogicID.EqualTo) {
    let text2 = "";
    if (array != null && array.length != 0) {
      for (let l = 0; l < array.length; l++) {
        text2 = text2 + "'" + array[l] + "'";
        if (l < array.length - 1) {
          text2 += ",";
        }
      }
      text = FiltrateFieldEN + " IN(" + text2 + ") ";
    }
    if (flag) {
      text += Default.IsNullOrEmpty(text)
        ? FiltrateFieldEN + " IS NULL "
        : "OR " + FiltrateFieldEN + " IS NULL ";
    }
    if (flag && DataType_ == Default.DataType.STR) {
      text = text + "OR (LENGTH( COALESCE(" + FiltrateFieldEN + ", '0'))<=0)";
    }
  } else if (
    condtion == Default.FiltrateLogicID.StartWith &&
    array != null &&
    array.length != 0
  ) {
    for (let m = 0; m < array.length; m++) {
      text = text + " " + FiltrateFieldEN + " like '" + array[m] + "%' ";
      if (m < array.length - 1) {
        text += " OR ";
      }
    }
    n;
  } else if (
    condtion == Default.FiltrateLogicID.EndWith &&
    array != null &&
    array.length != 0
  ) {
    for (let n = 0; n < array.length; n++) {
      text = text + " " + FiltrateFieldEN + " like '%" + array[n] + "' ";
      if (n < array.length - 1) {
        text += " OR ";
      }
    }
  } else if (
    condtion == Default.FiltrateLogicID.NotEndWith &&
    array != null &&
    array.length != 0
  ) {
    for (let num2 = 0; num2 < array.length; num2++) {
      text = text + " " + FiltrateFieldEN + " not like '%" + array[num2] + "' ";
      if (num2 < array.length - 1) {
        text += " OR ";
      }
    }
    text = text + " OR " + FiltrateFieldEN + " IS NULL ";
  } else if (
    condtion == Default.FiltrateLogicID.Contains &&
    array != null &&
    array.length != 0
  ) {
    for (let num3 = 0; num3 < array.length; num3++) {
      text = text + " " + FiltrateFieldEN + " like '%" + array[num3] + "%' ";
      if (num3 < array.length - 1) {
        text += " OR ";
      }
    }
  } else if (condtion == Default.FiltrateLogicID.IsEmpty) {
    if (DataType_ == Default.DataType.STR) {
      text =
        " " +
        FiltrateFieldEN +
        " IS NULL OR (LENGTH( COALESCE(" +
        FiltrateFieldEN +
        ", '0'))<=0)";
    } else {
      text = " " + FiltrateFieldEN + " IS NULL ";
    }
  } else if (condtion == Default.FiltrateLogicID.NotEqualTo) {
    let text3 = "";
    if (array != null && array.length != 0) {
      for (let num4 = 0; num4 < array.length; num4++) {
        text3 = text3 + "'" + array[num4] + "'";
        if (num4 < array.length - 1) {
          text3 += ",";
        }
      }
      if (flag) {
        text = FiltrateFieldEN + " NOT IN(" + text3 + ")";
      } else {
        text =
          FiltrateFieldEN +
          " NOT IN(" +
          text3 +
          ") OR " +
          FiltrateFieldEN +
          " IS NULL ";
      }
    }
    if (flag) {
      text = text + " AND " + FiltrateFieldEN + " IS NOT NULL ";
    }
    if (flag && DataType_ == Default.DataType.STR) {
      text = text + " AND (LENGTH( COALESCE(" + FiltrateFieldEN + ", '0'))>0)";
    }

    text =
      FiltrateFieldEN +
      " NOT IN(" +
      text3 +
      ") OR " +
      FiltrateFieldEN +
      " IS NULL ";
  } else if (
    condtion == Default.FiltrateLogicID.LessOrEqual &&
    array != null &&
    array.length != 0
  ) {
    for (let num5 = 0; num5 < array.length; num5++) {
      text = text + " " + FiltrateFieldEN + " <= '" + array[num5] + "' ";
      if (num5 < array.length - 1) {
        text += " OR ";
      }
    }
  } else if (
    condtion == Default.FiltrateLogicID.NotStartWith &&
    array != null &&
    array.length != 0
  ) {
    for (let num6 = 0; num6 < array.length; num6++) {
      text = text + " " + FiltrateFieldEN + " not like '" + array[num6] + "%' ";
      if (num6 < array.length - 1) {
        text += " OR ";
      }
    }
    text = text + " OR " + FiltrateFieldEN + " IS NULL ";
  } else if (
    condtion == Default.FiltrateLogicID.NotContains &&
    array != null &&
    array.length != 0
  ) {
    for (let num7 = 0; num7 < array.length; num7++) {
      text =
        text + " " + FiltrateFieldEN + " not like '%" + array[num7] + "%' ";
      if (num7 < array.length - 1) {
        text += " OR ";
      }
    }
    text = text + " OR " + FiltrateFieldEN + " IS NULL ";
  }
  if (!(text == "")) {
    return text;
  }
  return "1=1";
}
function GetDataFiltrateStr(
  condtion,
  vale,
  FiltrateFieldEN,
  DataSourceType_,
  DataType_ = Default.DataType.STR
) {
  let text = " ( ";
  if (DataType_ >= 3) {
    text += Default.BackFiltrateCondtion_DateTime(
      condtion,
      vale,
      FiltrateFieldEN,
      DataType_
    );
  } else {
    if (
      FiltrateFieldEN == "SFDD" &&
      DataSourceType_ != Default.DataSourceType.Account
    ) {
      if (vale == "已调单") {
        vale = "1";
      } else if (vale == "未调单") {
        vale = "0";
      }
    } else if (
      FiltrateFieldEN == "FPLX" &&
      DataSourceType_ == Default.DataSourceType.TaxDetail
    ) {
      if (vale == "专票") {
        vale = "1";
      } else if (vale == "普票") {
        vale = "0";
      }
    } else if (
      FiltrateFieldEN == "SWLX" &&
      DataSourceType_ == Default.DataSourceType.TaxDetail
    ) {
      if (vale == "销项") {
        vale = "1";
      } else if (vale == "进项") {
        vale = "0";
      }
    }
    text += BackFiltrateCondtion(condtion, vale, FiltrateFieldEN, DataType_);
  }
  text += " ) ";
  return text;
}
function j_GetDataFiltrateStr(pgid, DataFilterList) {
  let text = "";
  if (!DataFilterList || (DataFilterList && DataFilterList.length === 0))
    return text;
  let dataFilter = DataFilterList[0];
  let displayRelation = dataFilter.DisplayRelation;
  if (dataFilter.children.length <= 0) {
    return text;
  }
  for (let i = 0; i < dataFilter.children.length; i++) {
    let dataFilter2 = dataFilter.children[i];
    if (dataFilter2.ConditionNodeType == Default.NodeType.NodeType_Condition) {
      if (
        true
        // !Default.IsNullOrEmpty(dataFilter2.FiltrateValue) ||
        // dataFilter2.condtion == Default.FiltrateLogicID.IsEmpty ||
        // dataFilter2.condtion == Default.FiltrateLogicID.NotEmpty
      ) {
        let str = GetDataFiltrateStr(
          dataFilter2.condtion,
          dataFilter2.FiltrateValue,
          dataFilter2.FiltrateFieldEN,
          pgid,
          dataFilter2.FiltrateFieldType
        );
        if (i > 0) {
          str = displayRelation + str;
        }
        text += str;
      }
    } else {
      let str2 = dataFilter2.DisplayRelation;
      let text3 = "";
      for (let j = 0; j < dataFilter2.children.length; j++) {
        if (
          true
          // !Default.IsNullOrEmpty(dataFilter2.children[j].FiltrateValue) ||
          // dataFilter2.children[j].condtion == Default.FiltrateLogicID.IsEmpty ||
          // dataFilter2.children[j].condtion == Default.FiltrateLogicID.NotEmpty
        ) {
          let str3 = GetDataFiltrateStr(
            dataFilter2.children[j].condtion,
            dataFilter2.children[j].FiltrateValue,
            dataFilter2.children[j].FiltrateFieldEN,
            pgid,
            dataFilter2.children[j].FiltrateFieldType
          );
          if (j > 0) {
            str3 = str2 + str3;
          }
          text3 += str3;
        }
      }
      if (!Default.IsNullOrEmpty(text3)) {
        if (!Default.IsNullOrEmpty(text)) {
          text += displayRelation;
        }
        text3 = " (" + text3 + ") ";
        text += text3;
      }
    }
  }
  if (text != "") {
    text = " AND ( " + text + " )";
  }
  return text;
}

let ld = [];
ld.push(new Default.DataFilter(Default.NodeType.NodeType_ConditionList, "AND"));

ld[0].children.push(
  new Default.DataFilter(Default.NodeType.NodeType_ConditionList, "AND")
);
ld[0].children[0].children.push(
  new Default.DataFilter(Default.NodeType.NodeType_Condition)
);
ld[0].children[0].children.push(
  new Default.DataFilter(Default.NodeType.NodeType_Condition)
);
ld[0].children[0].children[0].FiltrateValue = "2";
ld[0].children[0].children[0].FiltrateFieldType = Default.DataType.STR;
ld[0].children[0].children[0].FiltrateFieldEN = "jymc";
ld[0].children[0].children[0].condtion = Default.FiltrateLogicID.EqualTo;
ld[0].children[0].children[1].FiltrateValue = "3";
ld[0].children[0].children[1].FiltrateFieldType = Default.DataType.STR;
ld[0].children[0].children[1].FiltrateFieldEN = "jymc";
ld[0].children[0].children[1].condtion = Default.FiltrateLogicID.EqualTo;

ld[0].children.push(
  new Default.DataFilter(Default.NodeType.NodeType_ConditionList, "AND")
);
ld[0].children[1].children.push(
  new Default.DataFilter(Default.NodeType.NodeType_Condition)
);
ld[0].children[1].children.push(
  new Default.DataFilter(Default.NodeType.NodeType_Condition)
);
ld[0].children[1].children[0].FiltrateValue = "5";
ld[0].children[1].children[0].FiltrateFieldType = Default.DataType.STR;
ld[0].children[1].children[0].FiltrateFieldEN = "jymc";
ld[0].children[1].children[0].condtion = Default.FiltrateLogicID.EqualTo;
ld[0].children[1].children[1].FiltrateValue = "2020-05-03 23:22:22";
ld[0].children[1].children[1].FiltrateFieldType = Default.GetTimeType(
  ld[0].children[1].children[1].FiltrateValue
);
ld[0].children[1].children[1].FiltrateFieldEN = "jymc";
ld[0].children[1].children[1].condtion = Default.FiltrateLogicID.EqualTo;
let res = j_GetDataFiltrateStr(200, ld);
console.log(res);

////////////////////////////////////////////////////////////////数据处理/////////////////////////////////////////////////////////////////////////////////////////////////
//获取根项默认sql,查找和执行  (无效数据，重复数据)
function GetRootDataRule(ruleType, dataTableName) {
  let CurrentSelectSql_ = "";
  let CurrentExeSql_ = "";
  let RULE_NAME_ = "";
  if (ruleType != Default.DataRuleType.Invalid) {
    if (ruleType == Default.DataRuleType.Repeat) {
      CurrentSelectSql_ =
        "SELECT COUNT(*) FROM (SELECT *,row_number() OVER (PARTITION BY $FILTER$ )AS tmp from " +
        dataTableName +
        " where ajid=$AJID$ $MODEL_FILTER$ ) t where t.tmp>=2";
      CurrentExeSql_ =
        "with A as ( SELECT *, $EMPTYFILTER$ as EmptyCnt FROM " +
        dataTableName +
        " where ajid=$AJID$ $MODEL_FILTER$)  DELETE FROM " +
        dataTableName +
        " WHERE SHARD_ID IN(SELECT SHARD_ID FROM(SELECT SHARD_ID, row_number() OVER(PARTITION BY $FILTER$  ORDER BY EmptyCnt ASC)AS tmp from A ) t where t.tmp >= 2)";
      RULE_NAME_ = "重复数据项";
    }
  } else {
    CurrentSelectSql_ =
      "SELECT $SELECTFILTER$ FROM  " +
      dataTableName +
      " WHERE AJID=$AJID$ $MODEL_FILTER$";
    CurrentExeSql_ =
      "DELETE FROM " + dataTableName + " WHERE AJID=$AJID$ $MODEL_FILTER$";
    RULE_NAME_ = "无效数据";
  }
  return new Default.DataRule(RULE_NAME_, CurrentSelectSql_, CurrentExeSql_);
}

//获取子项默认sql,查找和执行  (无效数据，重复数据)
function GetChildDataRule(
  ruleType,
  FiltrateFieldEN,
  FiltrateFieldCN,
  FiltrateFieldType
) {
  let CurrentSelectSql_ = "";
  let CurrentExeSql_ = "";
  let RULE_NAME_ = "";
  if (ruleType != Default.DataRuleType.Invalid) {
    if (ruleType == Default.DataRuleType.Repeat) {
      RULE_NAME_ = FiltrateFieldCN;
      CurrentSelectSql_ = FiltrateFieldEN;
      CurrentExeSql = FiltrateFieldEN;
    }
  } else {
    RULE_NAME_ = FiltrateFieldCN + "为空";
    if (
      FiltrateFieldType != Default.DataType.DECIMAL &&
      FiltrateFieldType != Default.DataType.DOUBLE
    ) {
      CurrentExeSql_ =
        " AND (LENGTH( COALESCE(" +
        FiltrateFieldEN +
        ", '0'))=0 OR " +
        FiltrateFieldEN +
        " IS NULL)";
    } else {
      CurrentExeSql_ = "  AND (" + FiltrateFieldEN + " IS NULL)";
    }
    CurrentSelectSql_ = CurrentExeSql;
    return new Default.DataRule(
      RULE_NAME_,
      CurrentSelectSql_,
      CurrentExeSql_,
      FiltrateFieldEN,
      FiltrateFieldType
    );
  }
}

/*
数据去重 获取$EMPTYFILTER$参数
FiltrateFieldEN : 未选中的字段名
FieldType : 字段类型
return : EMPTYFILTER字符串
*/
function Get_EMPTYFILTER(list_datarule) {
  let text = "";
  if (list_datarule != null && list_datarule.length > 0) {
    for (let i = 0; i < list_datarule.length; i++) {
      if (i > 0) {
        text += " + ";
      }
      if (list_datarule[i].FieldType == Default.DataType.STR) {
        text =
          text +
          "(CASE WHEN " +
          list_datarule[i].FiltrateFieldEN +
          " IS NULL OR (LENGTH( COALESCE(" +
          list_datarule[i].FiltrateFieldEN +
          ", '0'))=0) THEN 1 ELSE 0 END )";
      } else {
        text =
          text +
          "(CASE WHEN " +
          list_datarule[i].FiltrateFieldEN +
          " IS NULL THEN 1 ELSE 0 END )";
      }
    }
    return text;
  }
  return "0";
}

/////////////////////////////////同笔交易去重复///////////////////////////////////////////////
function TBRepeatDataModel(id_, cxkh_, jydfzkh_, jysj_, jdbz_, jyje_, tmp_) {
  this.shard_id = id_; //int
  this.cxkh = cxkh_;
  this.jydfzkh = jydfzkh_;
  this.jysj = jysj_;
  this.jdbz = jdbz_;
  this.jyje = jyje_ == "" ? 0.0 : Number(jyje_);
  this.groupflag = tmp_;
}
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
//找出重复同笔交易的shard_id,SecondInterval为设置的交易时间偏差
function GetTBRepeatDataIDList(SecondInterval, listTBRepeatDataModel) {
  let shard_idlist = [];
  let list = [];
  for (let i = 0; i < listTBRepeatDataModel.length; i++) {
    if (listTBRepeatDataModel[i].groupflag == "1") {
      let child_listid = findTBData(SecondInterval, list);
      if (
        child_listid != null &&
        child_listid != undefined &&
        child_listid.length > 0
      ) {
        for (let i = 0; i < child_listid.length; i++) {
          if (shard_idlist.indexOf(child_listid[i]) == -1) {
            shard_idlist.push(child_listid[i]);
          }
        }
      }
      list = [];
    }
    list.push(listTBRepeatDataModel[i]);
  }
  let child_listid = findTBData(SecondInterval, list);
  if (
    child_listid != null &&
    child_listid != undefined &&
    child_listid.length > 0
  ) {
    for (let i = 0; i < child_listid.length; i++) {
      if (shard_idlist.indexOf(child_listid[i]) == -1) {
        shard_idlist.push(child_listid[i]);
      }
    }
  }
  return shard_idlist;
}
function findTBData(SecondInterval, list) {
  if (list == null || list == undefined || list.length <= 0) {
    return null;
  }
  let list_in = [];
  let list_out = [];
  let list_id = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].jdbz == "进") {
      list_in.push(list[i]);
    } else if (list[i].jdbz == "出") {
      list_out.push(list[i]);
    }
  }
  if (list_in.length <= 0 || list_out.length <= 0) {
    return null;
  }
  for (let i = 0; i < list_out.length; i++) {
    for (let j = 0; j < list_in.length; j++) {
      let diff = dateDiff(list_out[i].jysj, list_in[j].jysj);
      if (diff <= SecondInterval && diff >= SecondInterval * -1) {
        list_id.push(list_in[j].shard_id);
      }
    }
  }
  return list_id;
}
// let obj1 = new TBRepeatDataModel(
//   1,
//   "1",
//   "1",
//   "2020-06-03 10:23:25",
//   "进",
//   "500",
//   "1"
// );
// let obj2 = new TBRepeatDataModel(
//   2,
//   "2",
//   "2",
//   "2020-06-03 10:23:27",
//   "进",
//   "500",
//   "2"
// );
// let obj3 = new TBRepeatDataModel(
//   3,
//   "1",
//   "1",
//   "2020-06-03 10:23:26",
//   "出",
//   "500",
//   "3"
// );
// let obj4 = new TBRepeatDataModel(
//   4,
//   "1",
//   "1",
//   "2020-06-03 10:23:23",
//   "进",
//   "500",
//   "1"
// );
// let obj5 = new TBRepeatDataModel(
//   5,
//   "1",
//   "1",
//   "2020-06-03 10:23:23",
//   "进",
//   "500",
//   "2"
// );
// let obj6 = new TBRepeatDataModel(
//   6,
//   "1",
//   "1",
//   "2020-06-03 10:23:23",
//   "进",
//   "500",
//   "1"
// );
// let obj7 = new TBRepeatDataModel(
//   7,
//   "1",
//   "1",
//   "2020-06-03 10:23:23",
//   "出",
//   "500",
//   "2"
// );
// let obj8 = new TBRepeatDataModel(
//   8,
//   "1",
//   "1",
//   "2020-06-03 10:23:23",
//   "进",
//   "500",
//   "1"
// );
// let listt = [obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8];
// console.log(GetTBRepeatDataIDList(1, listt));

export default {
  convertDataFilterToSqlStr: j_GetDataFiltrateStr,
};
