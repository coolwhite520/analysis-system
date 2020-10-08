/*   
通过layout_table_column link_mid找到连接跳转到的页面id。分为两类，一类当作数据中心页面，4为资金页面，18为通话页面；其他都可当作点击模型处理
当作为模型时,可以在layout_model_info中查询到模板sql

所有链接回调 
AnalysePageGrid_OnLinkClick 
参数 CA_PageItemDetail，CA_PageItem，ColumnName（英文列名）
CA_PageItem.M_TYPE传入当前页面的id，CA_PageItem.Sql_Detail传入link_mid对应模型的模板sql（4，18为空）
CA_PageItemDetail为详细参数：
大额交易行为账户发现 id=200,需要设置查询卡号 CA_PageItemDetail.cxkh
重点对手账户发现  id=202，需要设置查询卡号，交易对方张卡号  CA_PageItemDetail.cxkh ,CA_PageItemDetail.jydfzkh
重点对手户名发现 id=203, 需设置交易名称，交易对方名称   CA_PageItemDetail.jymc,CA_PageItemDetail.jydfmc

大额交易行为团伙账户发现 id=211,需要设置团伙划分CA_PageItemDetail.groupid：ThType.ThId去除"GROUP"，主体名称划分（jymc）,证照号码划分（jyzjhm）,交易卡号划分（cxkh）;CA_PageItemDetail.groupname为对应的值
重点交易对手团伙发现 id=213,需要设置团伙划分CA_PageItemDetail.groupid 以及对方CA_PageItemDetail.dfgroupid

交易账户关联对手账户（人）数   id=301,设置查询卡号CA_PageItemDetail.cxkh，交易名称CA_PageItemDetail.jymc,交易证件号码CA_PageItemDetail.jyzjhm
交易户名关联对手账户（人）数   id=302，设置交易名称CA_PageItemDetail.jymc，交易证件号码CA_PageItemDetail.jyzjhm
对手账户关联交易账户（人）数   id=303，设置交易对方账卡号CA_PageItemDetail.jydfzkh，交易对方名称CA_PageItemDetail.jydfmc，交易对方证件号码CA_PageItemDetail.jydfzjhm
对手户名关联交易账户（人）数   id=304，设置交易对方名称CA_PageItemDetail.jydfmc，交易对方证件号码CA_PageItemDetail.jydfzjhm


交易日期规律    id= 305，设置交易日期 CA_PageItemDetail.jysj
交易方式规律    id=  351，设置摘要说明 CA_PageItemDetail.zysm
交易金额区间规律   id=352，设置交易区间 CA_PageItemDetail.jyqj
交易地区分布    id= 353，设置省份名称 CA_PageItemDetail.sfmc
交易金额特征     id=354，设置交易金额 CA_PageItemDetail.jyje
交易时间规律     id=357，设置交易时间 CA_PageItemDetail.jysj
交易时段分析     id=358，设置交易区间 CA_PageItemDetail.jyqj,设置最早最晚时间CA_PageItemDetail.mindate,CA_PageItemDetail.maxdate(模型参数)
资金透视分析 id=421，设置CA_PageItemDetail.FiledENDictionary字典，内容为key=分类维度，value为对应的值
查找重点联系人 id=802，设置CA_PageItemDetail.ddfhm，CA_PageItemDetail.dfhm。调单方电话号码，对方电话号码
数据中心人员界面  id=1或2，设置CA_PageItemDetail.jyzjhm，CA_PageItemDetail.jymc。证件号码，交易名称
*/

import Default from "./Default";
const log = require("@/utils/log");
String.prototype.startWith = function(str) {
  var reg = new RegExp("^" + str);
  return reg.test(this);
};

String.prototype.endWith = function(str) {
  var reg = new RegExp(str + "$");
  return reg.test(this);
};
function IsNullOrEmpty(str) {
  return str == null || str.length == 0 || str == undefined;
}

function GetDataFilterFromList(list1, list2 = null) {
  let ld = [];
  ld.push(
    new Default.DataFilter(Default.NodeType.NodeType_ConditionList, "AND")
  );
  ld[0].children.push(
    new Default.DataFilter(Default.NodeType.NodeType_ConditionList, "AND")
  );
  if (list2 != null) {
    ld[0].DisplayRelation = "OR";
    ld[0].children.push(
      new Default.DataFilter(Default.NodeType.NodeType_ConditionList, "AND")
    );
  }
  for (let i = 0; i < list1.length; ++i) {
    ld[0].children[0].children.push(
      new Default.DataFilter(Default.NodeType.NodeType_Condition)
    );
    ld[0].children[0].children[i].FiltrateValue = list1[i].value;
    ld[0].children[0].children[i].FiltrateFieldEN = list1[i].name;
    ld[0].children[0].children[i].condtion = list1[i].type;
  }
  if (list2 != null) {
    for (let i = 0; i < list2.length; ++i) {
      ld[0].children[1].children.push(
        new Default.DataFilter(Default.NodeType.NodeType_Condition)
      );
      ld[0].children[1].children[i].FiltrateValue = list2[i].value;
      ld[0].children[1].children[i].FiltrateFieldEN = list2[i].name;
      ld[0].children[1].children[i].condtion = list2[i].type;
    }
  }
  return ld;
}
function GetIndex(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return i;
    }
  }
  return -1;
}

let CA_PageItem = {
  Sql_Detail: "", //模型sql模板
  M_TYPE: 0, //mid
};

function BackFiltrateCondtion(
  condtion,
  vale,
  FiltrateFieldEN,
  DataType_ = Default.DataType.STR
) {
  let text = "";
  let flag = false;
  let array = [];

  if (!IsNullOrEmpty(vale)) {
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
      text += IsNullOrEmpty(text)
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
      text = text + "AND " + FiltrateFieldEN + " IS NOT NULL ";
    }
    if (flag && DataType_ == Default.DataType.STR) {
      text = text + "AND (LENGTH( COALESCE(" + FiltrateFieldEN + ", '0'))>0)";
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
//时间字段格式化
function BackFiltrateCondtion_DateTime(
  condtion,
  vale,
  FiltrateFieldEN,
  DateTimeType
) {
  let result = "";
  let text;
  if (DateTimeType == 1) {
    text = "'YYYY-MM-DD HH24:MI:SS'";
  } else if (DateTimeType == 2) {
    text = "'YYYY-MM-DD'";
  } else {
    text = "'HH24:MI:SS'";
  }
  if (condtion == null) {
    return result;
  }
  if (condtion == Default.FiltrateLogicID.GreaterThan) {
    result = "".concat(
      "to_timestamp(",
      FiltrateFieldEN,
      ", ",
      text,
      ")  > to_timestamp('",
      vale,
      "', ",
      text,
      ")"
    );
  } else if (condtion == Default.FiltrateLogicID.LessThan) {
    result = "".concat(
      "to_timestamp(",
      FiltrateFieldEN,
      ", ",
      text,
      ")  < to_timestamp('",
      vale,
      "', ",
      text,
      ")"
    );
  } else if (condtion == Default.FiltrateLogicID.EqualTo) {
    result = "".concat(
      "to_timestamp(",
      FiltrateFieldEN,
      ", ",
      text,
      ")  = to_timestamp('",
      vale,
      "', ",
      text,
      ")"
    );
  } else if (condtion == Default.FiltrateLogicID.GreaterOrEqual) {
    result = "".concat(
      "to_timestamp(",
      FiltrateFieldEN,
      ", ",
      text,
      ")  >= to_timestamp('",
      vale,
      "', ",
      text,
      ")"
    );
  } else if (condtion == Default.FiltrateLogicID.IsEmpty) {
    result = "".concat(
      " ",
      FiltrateFieldEN,
      " IS NULL OR (LENGTH( COALESCE(",
      FiltrateFieldEN,
      ", '0'))<=0)"
    );
  } else if (condtion == Default.FiltrateLogicID.NotEmpty) {
    result = "".concat(
      " ",
      FiltrateFieldEN,
      " IS NOT NULL AND (LENGTH( COALESCE(",
      FiltrateFieldEN,
      ", '0'))>0)"
    );
  } else if (condtion == Default.FiltrateLogicID.NotEqualTo) {
    result = "".concat(
      "to_timestamp(",
      FiltrateFieldEN,
      ", ",
      text,
      ")  != to_timestamp('",
      vale,
      "', ",
      text,
      ") OR ",
      FiltrateFieldEN,
      " IS NULL "
    );
  } else if (condtion == Default.FiltrateLogicID.LessOrEqual) {
    result = "".concat(
      "to_timestamp(",
      FiltrateFieldEN,
      ", ",
      text,
      ")  <= to_timestamp('",
      vale,
      "', ",
      text,
      ")"
    );
  }
  return result;
}

function GetdisplayRelation(dataFilter) {
  return dataFilter == "且" ? "AND" : "OR";
}
function GetListCondition(list, timeindex = [], timetype = []) {
  let text = "";
  if (list == null || list == undefined || list.length <= 0) {
    return text;
  }

  text += " (";
  for (let i = 0; i < list.length; i++) {
    if (list[i].name == "SFDD") {
      if (list[i].value == "已调单") {
        list[i].value = "1";
      } else if (list[i].value == "未调单") {
        list[i].value = "0";
      }
    } else if (list[i].name == "FPLX") {
      if (list[i].value == "专票") {
        list[i].value = "1";
      } else if (list[i].value == "普票") {
        list[i].value = "0";
      }
    } else if (list[i].name == "SWLX") {
      if (list[i].value == "销项") {
        list[i].value = "1";
      } else if (list[i].value == "进项") {
        list[i].value = "0";
      }
    }
    let index = GetIndex(timeindex, i);
    if (index != -1) {
      text =
        text +
        " ( " +
        BackFiltrateCondtion_DateTime(
          list[i].type,
          list[i].value,
          list[i].name,
          timetype[index]
        ) +
        " ) ";
    } else {
      text =
        text +
        " ( " +
        BackFiltrateCondtion(list[i].type, list[i].value, list[i].name) +
        " ) ";
    }

    if (i != list.length - 1) {
      text += " AND ";
    }
  }
  text += " )";
  return text;
}

//MD_TYPE==1:证件号码过滤，MD_TYPE==2：交易名称过滤
function Get203DetailCondition(PageItemDetail, ColumnName = "", MD_TYPE = "2") {
  let list = [];
  let list2 = [];
  let list3 = [];
  if (MD_TYPE == "1") {
    list.push({
      name: "JYZJHM",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jyzjhm.replace(/'/g, ""),
    });
    list.push({
      name: "JYDFZJHM",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jydfzjhm.replace(/'/g, ""),
    });
    list2.push({
      name: "JYZJHM",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jydfzjhm.replace(/'/g, ""),
    });
    list2.push({
      name: "JYDFZJHM",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jyzjhm.replace(/'/g, ""),
    });
  } else if (MD_TYPE == "2") {
    list.push({
      name: "JYMC",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jymc.replace(/'/g, ""),
    });
    list.push({
      name: "JYDFMC",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jydfmc.replace(/'/g, ""),
    });
    list2.push({
      name: "JYMC",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jydfmc.replace(/'/g, ""),
    });
    list2.push({
      name: "JYDFMC",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.jymc.replace(/'/g, ""),
    });
  }
  if (ColumnName == "CZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
    list2.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
    list2.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  let text = "";
  text += " AND( ";
  text += GetListCondition(list);
  text = text + " OR " + GetListCondition(list2);
  text += " )";
  //return text
  return { str: text, obj: GetDataFilterFromList(list, list2) };
}
function Get200DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  list.push({
    name: "CXKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.cxkh.replace(/'/g, ""),
  });
  if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "CZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  }; //(" AND "+ GetListCondition(list));
}
function Get202DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  let list2 = [];
  let list3 = [];
  list2.push({
    name: "CXKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.cxkh.replace(/'/g, ""),
  });
  list2.push({
    name: "JYDFZKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfzkh.replace(/'/g, ""),
  });
  list3.push({
    name: "CXKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfzkh.replace(/'/g, ""),
  });
  list3.push({
    name: "JYDFZKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.cxkh.replace(/'/g, ""),
  });
  if (ColumnName == "JZBS") {
    list2.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
    list3.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  } else if (ColumnName == "CZBS") {
    list2.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
    list3.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  }
  let text = "";
  text += " AND( ";
  text += GetListCondition(list2);
  text = text + " OR " + GetListCondition(list3);
  text += " )";
  return { str: text, obj: GetDataFilterFromList(list2, list3) }; //text
}
function Get211DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  list.push({
    name: PageItemDetail.groupid,
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.groupname.replace(/'/g, ""),
  });
  if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "CZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list;
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  }; //(" AND "+ GetListCondition(list));
}
function Get213DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  let list2 = [];
  let list3 = [];
  list2.push({
    name: PageItemDetail.groupid,
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.groupname.replace(/'/g, ""),
  });
  list2.push({
    name: PageItemDetail.dfgroupid,
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.dfgroupname.replace(/'/g, ""),
  });
  list3.push({
    name: PageItemDetail.groupid,
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.dfgroupname.replace(/'/g, ""),
  });
  list3.push({
    name: PageItemDetail.dfgroupid,
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.groupname.replace(/'/g, ""),
  });

  if (ColumnName == "JZBS") {
    list2.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
    list3.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  } else if (ColumnName == "CZBS") {
    list2.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
    list3.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  }
  let text = "";
  text += " AND( ";
  text += GetListCondition(list2);
  text = text + " OR " + GetListCondition(list3);
  text += " )";
  //return text
  return { str: text, obj: GetDataFilterFromList(list2, list3) };
}
function Get301DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  list.push({
    name: "CXKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.cxkh.replace(/'/g, ""),
  });
  list.push({
    name: "JYMC",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jymc.replace(/'/g, ""),
  });
  list.push({
    name: "JYZJHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jyzjhm.replace(/'/g, ""),
  });
  list.push({
    name: "JDBZ",
    type: Default.FiltrateLogicID.EqualTo,
    value: ColumnName == "JZBS" ? "进" : "出",
  });
  //return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get302DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  list.push({
    name: "JYMC",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jymc.replace(/'/g, ""),
  });
  list.push({
    name: "JYZJHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jyzjhm.replace(/'/g, ""),
  });
  list.push({
    name: "JDBZ",
    type: Default.FiltrateLogicID.EqualTo,
    value: ColumnName == "JZBS" ? "进" : "出",
  });
  // return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get303DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  list.push({
    name: "JYDFZKH",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfzkh.replace(/'/g, ""),
  });
  list.push({
    name: "JYDFMC",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfmc.replace(/'/g, ""),
  });
  list.push({
    name: "JYDFZJHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfzjhm.replace(/'/g, ""),
  });
  list.push({
    name: "JDBZ",
    type: Default.FiltrateLogicID.EqualTo,
    value: ColumnName == "JZBS" ? "进" : "出",
  });
  //return list
  // return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get304DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  list.push({
    name: "JYDFMC",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfmc.replace(/'/g, ""),
  });
  list.push({
    name: "JYDFZJHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jydfzjhm.replace(/'/g, ""),
  });
  list.push({
    name: "JDBZ",
    type: Default.FiltrateLogicID.EqualTo,
    value: ColumnName == "JZBS" ? "进" : "出",
  });
  //return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get305DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  list.push({
    name: "JYSJ",
    type: Default.FiltrateLogicID.Contains,
    value: PageItemDetail.jysj.replace(/'/g, ""),
  });
  if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "CZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get351DetailCondition(PageItemDetail, ColumnName = "") {
  let list = [];
  list.push({
    name: "zysm",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.zysm.replace(/'/g, ""),
  });
  if (ColumnName == "INCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "OUTCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get352DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  let text = PageItemDetail.jyqj.replace(/'/g, "").replace(/万/g, "0000");
  if (text.indexOf("以下") >= 0) {
    list.push({
      name: "JYJE",
      type: Default.FiltrateLogicID.LessThan,
      value: text.replace(/以下/g, ""),
    });
  } else if (text.indexOf("以上") >= 0) {
    list.push({
      name: "JYJE",
      type: Default.FiltrateLogicID.GreaterOrEqual,
      value: text.replace(/以上/g, ""),
    });
  } else {
    let arr = text.split("-");
    list.push({
      name: "JYJE",
      type: Default.FiltrateLogicID.GreaterOrEqual,
      value: arr[0],
    });
    list.push({
      name: "JYJE",
      type: Default.FiltrateLogicID.LessThan,
      value: arr[1],
    });
  }
  if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "CZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list;
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get353DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  if (PageItemDetail.sfmc.replace(/'/g, "") == "未知") {
    list.push({
      name: "JYFSD",
      type: Default.FiltrateLogicID.NotContains,
      value: "自治区",
    });
    list.push({
      name: "JYFSD",
      type: Default.FiltrateLogicID.NotContains,
      value: "省",
    });
    list.push({
      name: "JYFSD",
      type: Default.FiltrateLogicID.NotContains,
      value: "市",
    });
  } else if (
    !PageItemDetail.sfmc.EndsWith("自治区'") &&
    !PageItemDetail.sfmc.EndsWith("省'") &&
    !PageItemDetail.sfmc.EndsWith("市'")
  ) {
    list.push({
      name: "JYFSD",
      type: Default.FiltrateLogicID.Contains,
      value: PageItemDetail.sfmc.replace(/'/g, ""),
    });
  } else {
    list.push({
      name: "JYFSD",
      type: Default.FiltrateLogicID.EqualTo,
      value: PageItemDetail.sfmc.replace(/'/g, ""),
    });
  }
  if (ColumnName == "INCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "OUTCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get354DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  list.push({
    name: "JYJE",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jyje.replace(/'/g, ""),
  });
  if (ColumnName == "INCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "OUTCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list
  //return (" AND "+ GetListCondition(list));
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get357DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  list.push({
    name: "JYSJ",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jysj.replace(/'/g, ""),
  });
  if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "OUTCOUNT") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  //return list
  //return (" AND "+ GetListCondition(list,[0],[1]));
  return {
    str: " AND " + GetListCondition(list, [0], [1]),
    obj: GetDataFilterFromList(list),
  };
}
function Get358DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  let arr = PageItemDetail.jyqj
    .replace(/'/g, "")
    .replace(/时/g, "")
    .split("-");
  var text = arr[0].length == 2 ? " " + arr[0] + ":" : " 0" + arr[0] + ":";
  list.push({
    name: "JYSJ",
    type: Default.FiltrateLogicID.Contains,
    value: text,
  });
  list.push({
    name: "JYSJ",
    type: Default.FiltrateLogicID.GreaterOrEqual,
    value: PageItemDetail.mindate,
  });
  list.push({
    name: "JYSJ",
    type: Default.FiltrateLogicID.LessOrEqual,
    value: PageItemDetail.maxdate,
  });
  if (ColumnName == "JZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "进",
    });
  } else if (ColumnName == "CZBS") {
    list.push({
      name: "JDBZ",
      type: Default.FiltrateLogicID.EqualTo,
      value: "出",
    });
  }
  return {
    str: " AND " + GetListCondition(list, [1, 2], [1, 1]),
    obj: GetDataFilterFromList(list),
  };
}
//421资金透视分析模型，点击交易次数，对手数量。所执行sql与展示结果都一样。
function Get421DetailCondition(PageItemDetail, ColumnName) {
  let list = [];
  if (PageItemDetail.FiledENDictionary != null) {
    for (var item in PageItemDetail.FiledENDictionary) {
      if (
        PageItemDetail.FiledENDictionary[item].replace(/'/g, "") == null ||
        PageItemDetail.FiledENDictionary[item].replace(/'/g, "") == ""
      ) {
        list.push({
          name: item,
          type: Default.FiltrateLogicID.IsEmpty,
          value: PageItemDetail.FiledENDictionary[item].replace(/'/g, ""),
        });
      } else {
        list.push({
          name: item,
          type: Default.FiltrateLogicID.EqualTo,
          value: PageItemDetail.FiledENDictionary[item].replace(/'/g, ""),
        });
      }
    }
  }
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function Get802PhoneDetailCondition(PageItemDetail) {
  let list = [];
  list.push({
    name: "DDFHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.ddfhm,
  });
  list.push({
    name: "DFHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.dfhm,
  });
  return {
    str: " AND " + GetListCondition(list),
    obj: GetDataFilterFromList(list),
  };
}
function GetPersonDetailCondition(PageItemDetail) {
  let list = [];
  let list2 = [];
  let list3 = [];
  list2.push({
    name: "JYZJHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jyzjhm,
  });
  list2.push({
    name: "JYMC",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jymc,
  });
  list3.push({
    name: "JYDFZJHM",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jyzjhm,
  });
  list3.push({
    name: "JYDFMC",
    type: Default.FiltrateLogicID.EqualTo,
    value: PageItemDetail.jymc,
  });
  let text = "";
  text += " AND( ";
  text += GetListCondition(list2);
  text = text + " OR " + GetListCondition(list3);
  text += " )";
  //return text
  return { str: text, obj: GetDataFilterFromList(list2, list3) };
}

function Get307CA_PageItem(_CA_PageItemDetail, CurrTabItem, ColumnName) {
  let newValue = "";
  let newValue2 = "";
  if (!(ColumnName == "JGLDSRS") && !(ColumnName == "JGLDSZHS")) {
    if (ColumnName == "CGLDSRS" || ColumnName == "CGLDSZHS") {
      newValue = " AND jdbz = '出'";
    }
  } else {
    newValue = " AND jdbz = '进'";
  }
  if (CurrTabItem.M_TYPE == 301) {
    //mid=301,交易账户关联对手账户（人）数
    newValue2 = " AND cxkh = '" + _CA_PageItemDetail.cxkh + "'"; //jykh交易卡号
  }
  let sql = _CA_PageItemDetail.CurrentExeSql.replace(/\$CXKH\$/g, newValue2)
    .replace(/\$JYMC\$/g, "'" + _CA_PageItemDetail.jymc + "'")
    .replace(/\$JYZJHM\$/g, "'" + _CA_PageItemDetail.jyzjhm + "'")
    .replace(/\$JDBZ\$/g, newValue);
  return sql;
}
function Get308CA_PageItem(_CA_PageItemDetail, CurrTabItem, ColumnName) {
  let newValue = "";
  let newValue2 = "";
  if (!(ColumnName == "JGLDSRS") && !(ColumnName == "JGLDSZHS")) {
    if (ColumnName == "CGLDSRS" || ColumnName == "CGLDSZHS") {
      newValue = " AND jdbz = '出'";
    }
  } else {
    newValue = " AND jdbz = '进'";
  }
  if (CurrTabItem.M_TYPE == 301) {
    //mid=301,交易账户关联对手账户（人）数
    newValue2 = " AND cxkh = '" + _CA_PageItemDetail.cxkh + "'"; //jykh交易卡号
  }
  let sql = _CA_PageItemDetail.CurrentExeSql.replace(/\$CXKH\$/g, newValue2)
    .replace(/\$JYMC\$/g, "'" + _CA_PageItemDetail.jymc + "'")
    .replace(/\$JYZJHM\$/g, "'" + _CA_PageItemDetail.jyzjhm + "'")
    .replace(/\$JDBZ\$/g, newValue);
  return sql;
}
//人员或单位界面（非模型界面），点击关联账户数
function Get309CA_PageItem(_CA_PageItemDetail) {
  return _CA_PageItemDetail.CurrentExeSql.replace(
    /\$JYZJHM\$/g,
    "'" + _CA_PageItemDetail.jyzjhm + "'"
  )
    .replace(/\$ZZHMLX\$/g, "'" + _CA_PageItemDetail.zzlxmc + "'")
    .replace(/\$JYMC\$/g, "'" + _CA_PageItemDetail.jymc + "'");
}
function Get310CA_PageItem(_CA_PageItemDetail, CurrTabItem, ColumnName) {
  let newValue = "";
  let newValue2 = "";
  if (!(ColumnName == "JGLDDRS") && !(ColumnName == "JGLDDZHS")) {
    if (ColumnName == "CGLDDRS" || ColumnName == "CGLDDZHS") {
      newValue = " AND jdbz = '出'";
    }
  } else {
    newValue = " AND jdbz = '进'";
  }
  if (CurrTabItem.M_TYPE == 303) {
    //mid=303,对手账户关联交易账户（人）数
    newValue2 = " AND jydfzkh = '" + _CA_PageItemDetail.jydfzkh + "'"; //jykh交易卡号
  }
  let sql = _CA_PageItemDetail.CurrentExeSql.replace(/\$JYDFZKH\$/g, newValue2)
    .replace(/\$JYDFMC\$/g, "'" + _CA_PageItemDetail.jydfmc + "'")
    .replace(/\$JYDFZJHM\$/g, "'" + _CA_PageItemDetail.jydfzjhm + "'")
    .replace(/\$JDBZ\$/g, newValue);
  return sql;
}
function Get311CA_PageItem(_CA_PageItemDetail, CurrTabItem, ColumnName) {
  let newValue = "";
  let newValue2 = "";
  if (!(ColumnName == "JGLDDRS") && !(ColumnName == "JGLDDZHS")) {
    if (ColumnName == "CGLDDRS" || ColumnName == "CGLDDZHS") {
      newValue = " AND jdbz = '出'";
    }
  } else {
    newValue = " AND jdbz = '进'";
  }
  if (CurrTabItem.M_TYPE == 303) {
    //mid=303,对手账户关联交易账户（人）数
    newValue2 = " AND JYDFZKH = '" + _CA_PageItemDetail.jydfzkh + "'"; //jykh交易卡号
  }
  let sql = _CA_PageItemDetail.CurrentExeSql.replace(/\$JYDFZKH\$/g, newValue2)
    .replace(/\$JYDFMC\$/g, "'" + _CA_PageItemDetail.jydfmc + "'")
    .replace(/\$JYDFZJHM\$/g, "'" + _CA_PageItemDetail.jydfzjhm + "'")
    .replace(/\$JDBZ\$/g, newValue);
  return sql;
}
function Get805CA_PageItem(_CA_PageItemDetail, CurrTabItem) {
  return _CA_PageItemDetail.CurrentExeSql.replace(
    /\$DDFHM\$/g,
    "'" + _CA_PageItemDetail.ddfhm + "'"
  );
}
function Get806CA_PageItem(_CA_PageItemDetail, CurrTabItem) {
  return _CA_PageItemDetail.CurrentExeSql.replace(
    /\$DFHM\$/g,
    "'" + _CA_PageItemDetail.dfhm + "'"
  );
}
function Get813CA_PageItem(_CA_PageItemDetail, CurrTabItem) {
  return _CA_PageItemDetail.CurrentExeSql.replace(
    /\$DDFHM\$/g,
    "'" + _CA_PageItemDetail.ddfhm + "'"
  );
}
function Get814CA_PageItem(_CA_PageItemDetail, CurrTabItem) {
  return _CA_PageItemDetail.CurrentExeSql.replace(
    /\$DFHM\$/g,
    "'" + _CA_PageItemDetail.dfhm + "'"
  );
}
function Get824CA_PageItem(_CA_PageItemDetail, CurrTabItem) {
  return _CA_PageItemDetail.CurrentExeSql.replace(
    /\$DDFHM\$/g,
    "'" + _CA_PageItemDetail.ddfhm + "'"
  ).replace(/\$DFHM\$/g, "'" + _CA_PageItemDetail.dfhm + "'");
}

function AnalysePageGrid_OnLinkClick(
  cA_PageItemDetail,
  CurrTabItem,
  ColumnName
) {
  /*if (cA_PageItemDetail.CurrCellVal == "'0'"){
        log.info(cA_PageItemDetail.componentName+"没有可钻取的数据");
        return;
    }*/
  cA_PageItemDetail.CurrentExeSql = CurrTabItem.Sql_Detail; //模型模板sql
  let list;
  if (CurrTabItem.M_TYPE == 203) {
    let list_ = Get203DetailCondition(
      cA_PageItemDetail,
      ColumnName /*,CurrTabItem.MD_TYPE*/
    );
    //method_8(cA_PageItemDetail, null, list_)
    return { type: "4", msg: list_ };
  }
  if (CurrTabItem.M_TYPE != 802 && CurrTabItem.M_TYPE != 805) {
    if (CurrTabItem.M_TYPE != 806) {
      if (CurrTabItem.M_TYPE == 803) {
        if (ColumnName == "THZCS") {
          list.push({
            name: "DDFHM",
            type: Default.FiltrateLogicID.EqualTo,
            value: cA_PageItemDetail.ddfhm,
          });
          //method_9(cA_PageItemDetail, list, null)
          let sql = " AND " + GetListCondition(list);
          //return  {type:"18",msg:sql}
          return {
            type: "18",
            msg: { str: sql, obj: GetDataFilterFromList(list) },
          };
        }
        if (ColumnName == "GLDFDHHMS") {
          let sql = Get805CA_PageItem(cA_PageItemDetail, CurrTabItem);
          //OpenAnalyseTab(sql)
          //return  {type:"805",msg:sql}
          return { type: "805", msg: { str: sql, obj: null } };
        }
      } else if (CurrTabItem.M_TYPE == 804) {
        if (ColumnName == "THZCS") {
          list.push({
            name: "DFHM",
            type: Default.FiltrateLogicID.EqualTo,
            value: cA_PageItemDetail.dfhm,
          });
          //method_9(cA_PageItemDetail, list, null)
          let sql = " AND " + GetListCondition(list);
          //return {type:"18",msg:sql}
          return {
            type: "18",
            msg: { str: sql, obj: GetDataFilterFromList(list) },
          };
        }
        if (ColumnName == "GLDDFDHHMS") {
          let sql = Get806CA_PageItem(cA_PageItemDetail, CurrTabItem);
          //OpenAnalyseTab(sql)
          //return  {type:"806",msg:sql}
          return { type: "806", msg: { str: sql, obj: null } };
        }
      } else {
        if (CurrTabItem.M_TYPE == 811) {
          let sql = Get813CA_PageItem(cA_PageItemDetail, CurrTabItem);
          //OpenAnalyseTab(sql)
          //return  {type:"813",msg:sql}
          return { type: "813", msg: { str: sql, obj: null } };
        }
        if (CurrTabItem.M_TYPE == 812) {
          let sql = Get814CA_PageItem(cA_PageItemDetail, CurrTabItem);
          //OpenAnalyseTab(sql)
          //return  {type:"814",msg:sql}
          return { type: "814", msg: { str: sql, obj: null } };
        }
        if (CurrTabItem.M_TYPE == 822) {
          let sql = Get824CA_PageItem(cA_PageItemDetail, CurrTabItem);
          //OpenAnalyseTab(sql)
          //return  {type:"824",msg:sql}
          return { type: "824", msg: { str: sql, obj: null } };
        }
        if (CurrTabItem.M_TYPE != 301) {
          if (CurrTabItem.M_TYPE != 302) {
            if (CurrTabItem.M_TYPE != 303) {
              if (CurrTabItem.M_TYPE != 304) {
                if (CurrTabItem.M_TYPE == 200) {
                  list = Get200DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 202) {
                  let list_2 = Get202DetailCondition(
                    cA_PageItemDetail,
                    ColumnName
                  );
                  //method_8(cA_PageItemDetail, null, list_2);
                  return { type: "4", msg: list_2 };
                }
                if (CurrTabItem.M_TYPE == 354) {
                  list = Get354DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 357) {
                  list = Get357DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 351) {
                  list = Get351DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 353) {
                  list = Get353DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 305) {
                  list = Get305DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 352) {
                  list = Get352DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 358) {
                  list = Get358DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 211) {
                  list = Get211DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                if (CurrTabItem.M_TYPE == 213) {
                  let list_3 = Get213DetailCondition(
                    cA_PageItemDetail,
                    ColumnName
                  );
                  //method_8(cA_PageItemDetail, null, list_3);
                  return { type: "4", msg: list_3 };
                }
                if (CurrTabItem.M_TYPE == 421) {
                  list = Get421DetailCondition(cA_PageItemDetail, ColumnName);
                  //method_8(cA_PageItemDetail, list, null);
                  return { type: "4", msg: list };
                }
                //人员界面，此处非模型
                if (CurrTabItem.M_TYPE == 1 || CurrTabItem.M_TYPE == 2) {
                  if (ColumnName == "JYBS") {
                    let sql = GetPersonDetailCondition(cA_PageItemDetail);
                    return { type: "4", msg: sql };
                  } else if (ColumnName == "GLZHS") {
                    let sql_tmp = Get309CA_PageItem(cA_PageItemDetail);
                    return { type: "309", msg: { str: sql_tmp, obj: null } };
                  }
                }
                return null;
              }
            }
            if (
              ColumnName == "GLDDRS" ||
              ColumnName == "JGLDDRS" ||
              ColumnName == "CGLDDRS"
            ) {
              let sql = Get310CA_PageItem(
                cA_PageItemDetail,
                CurrTabItem,
                ColumnName
              );
              //OpenAnalyseTab(sql)
              return { type: "310", msg: { str: sql, obj: null } };
            }
            if (
              ColumnName == "GLDDZHS" ||
              ColumnName == "JGLDDZHS" ||
              ColumnName == "CGLDDZHS"
            ) {
              let sql = Get311CA_PageItem(
                cA_PageItemDetail,
                CurrTabItem,
                ColumnName
              );
              //OpenAnalyseTab(sql)
              return { type: "311", msg: { str: sql, obj: null } };
            }
            if (ColumnName == "JZBS" || ColumnName == "CZBS") {
              if (CurrTabItem.M_TYPE == 303) {
                list = Get303DetailCondition(cA_PageItemDetail, ColumnName);
              } else if (CurrTabItem.M_TYPE == 304) {
                list = Get304DetailCondition(cA_PageItemDetail, ColumnName);
              }
              //method_8(cA_PageItemDetail, list, null);
              //return {type:"4",msg:list}
              return { type: "4", msg: list };
            }
            return null;
          }
        }
        if (
          ColumnName == "GLDSRS" ||
          ColumnName == "JGLDSRS" ||
          ColumnName == "CGLDSRS"
        ) {
          let sql = Get307CA_PageItem(
            cA_PageItemDetail,
            CurrTabItem,
            ColumnName
          );
          //OpenAnalyseTab(sql)
          return { type: "307", msg: { str: sql, obj: null } };
        }
        if (
          ColumnName == "GLDSZHS" ||
          ColumnName == "JGLDSZHS" ||
          ColumnName == "CGLDSZHS"
        ) {
          let sql = Get308CA_PageItem(
            cA_PageItemDetail,
            CurrTabItem,
            ColumnName
          );
          //OpenAnalyseTab(sql)
          return { type: "308", msg: { str: sql, obj: null } };
        }
        if (ColumnName == "JZBS" || ColumnName == "CZBS") {
          if (CurrTabItem.M_TYPE == 301) {
            list = Get301DetailCondition(cA_PageItemDetail, ColumnName);
          } else if (CurrTabItem.M_TYPE == 302) {
            list = Get302DetailCondition(cA_PageItemDetail, ColumnName);
          }
          //method_8(cA_PageItemDetail, list, null);
          return { type: "4", msg: list };
        }
      }
      return null;
    }
  }
  list = Get802PhoneDetailCondition(cA_PageItemDetail);
  //method_9(cA_PageItemDetail, list, null);
  return { type: "18", msg: list };
}
function OnLinkClick(CA_PageItem, item, parm, ColumnName) {
  let CA_PageItemDetail = {
    CurrentExeSql: "", //模型模板sql
    cxkh: "", //交易卡号
    jymc: "", //交易名称
    jydfmc: "", //交易对方名称
    jydfzkh: "", //交易对方卡号
    jyzjhm: "", //交易证件号码
    jydfzjhm: "", //交易对方证件号码
    jyje: 0, //交易金额
    ddfhm: "", //调单方号码
    dfhm: "", //对方号码
    jysj: "", //交易时间
    zzlxmc: "", //证照类型名称
    zysm: "", //摘要说明
    sfmc: "", //省份名称
    jyqj: "", //交易区间;时段区间
    groupname: "", //分组值
    groupid: "", //分组ID名称
    dfgroupname: "", //对方分组名称
    dfgroupid: "", //对方组ID
    FiledENDictionary: {}, //filed字典，421资金透视分析模型参数
    mindate: "", //最小日期,358交易时段分析模型参数
    maxdate: "", //最大日期,358交易时段分析模型参数
    //LinkDetailCondition:""
  };
  switch (CA_PageItem.M_TYPE) {
    case 1:
    case 2:
      CA_PageItemDetail.jyzjhm = item["zzhm"].trim();
      CA_PageItemDetail.zzlxmc = item["zzlxmc"].trim();
      CA_PageItemDetail.jymc = item["khmc"].trim();
      break;
    case 202:
      CA_PageItemDetail.jydfzkh = item["jydfzkh"].trim();
    case 200:
      CA_PageItemDetail.cxkh = item["cxkh"].trim();
      break;
    case 203:
      CA_PageItemDetail.jymc = item["jymc"].trim();
      CA_PageItemDetail.jydfmc = item["jydfmc"].trim();
      break;
    case 213:
      let dsthid = parm["SelectThType"]["DsThId"].toLowerCase();
      CA_PageItemDetail.dfgroupid = dsthid.split("group")[0];
      CA_PageItemDetail.dfgroupname = item[dsthid].trim();
    case 211:
      let thid = parm["SelectThType"].ThId.toLowerCase();
      CA_PageItemDetail.groupid = thid.split("group")[0];
      CA_PageItemDetail.groupname = item[thid].trim();
      break;
    case 301:
      CA_PageItemDetail.cxkh = item["cxkh"].trim();
    case 302:
      CA_PageItemDetail.jymc = item["jymc"].trim();
      CA_PageItemDetail.jyzjhm = item["jyzjhm"].trim();
      break;
    case 303:
      CA_PageItemDetail.jydfzkh = item["jydfzkh"].trim();
    case 304:
      CA_PageItemDetail.jydfmc = item["jydfmc"].trim();
      CA_PageItemDetail.jydfzjhm = item["jydfzjhm"].trim();
      break;
    case 305:
      CA_PageItemDetail.jysj = item["jyrq"].trim();
      break;
    case 351:
      CA_PageItemDetail.zysm = item["zysm"].trim();
      break;
    case 358:
      CA_PageItemDetail.mindate = parm["MinDate"];
      CA_PageItemDetail.maxdate = parm["MaxDate"];
    case 352:
      CA_PageItemDetail.jyqj = item["jyqj"].trim();
      break;
    case 353:
      CA_PageItemDetail.sfmc = item["sfmc"].trim();
      break;
    case 354:
      CA_PageItemDetail.jyje = item["jyje"].trim();
      break;
    case 357:
      CA_PageItemDetail.jysj = item["jysj"].trim();
      break;
    case 421:
      let arr = parm["String_1"].split(",");
      for (let i = 0; i < arr.length; i++) {
        let field = arr[i].toLowerCase();
        CA_PageItemDetail.FiledENDictionary[field] = item[field].trim();
      }
      break;
    case 802:
    case 805:
    case 804:
    case 812:
      CA_PageItemDetail.dfhm = item["dfhm"].trim();
      if (CA_PageItem.M_TYPE == 804 || CA_PageItem.M_TYPE == 812) {
        break;
      }
    case 803:
    case 811:
      CA_PageItemDetail.ddfhm = item["ddfhm"].trim();
      break;
    case 822:
      CA_PageItemDetail.ddfhm = item["sjhm"].trim();
      CA_PageItemDetail.dfhm = item["sjhm"].trim();
      break;
  }
  return AnalysePageGrid_OnLinkClick(
    CA_PageItemDetail,
    CA_PageItem,
    ColumnName
  );
}

CA_PageItem.M_TYPE = 203;
let res = OnLinkClick(
  CA_PageItem,
  { jydfmc: "zhangsan", jymc: "123456" },
  { String_1: "jydfzkh,cxkh" },
  "JZBS"
);

if (res != null) console.dir(res["msg"]["obj"][0]);

export default {
  format: OnLinkClick,
};
