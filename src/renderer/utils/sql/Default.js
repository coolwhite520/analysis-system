function GetBankDetailTableSumSql(TableName) {
  return "".concat(
    "(  SELECT *, (CASE WHEN CXKHGROUPNAME IS NULL THEN CXKH ELSE CXKHGROUPNAME END) AS CXKHGROUP,  (CASE WHEN JYDFZKHGROUPNAME IS NULL THEN JYDFZKH ELSE JYDFZKHGROUPNAME END) AS JYDFZKHGROUP,  (CASE WHEN JYZJHMGROUPNAME IS NULL THEN JYZJHM ELSE JYZJHMGROUPNAME END) AS JYZJHMGROUP, (CASE WHEN JYDFZJHMGROUPNAME IS NULL THEN JYDFZJHM ELSE JYDFZJHMGROUPNAME END) AS JYDFZJHMGROUP,  (CASE WHEN JYMCGROUPNAME IS NULL THEN JYMC ELSE JYMCGROUPNAME END) AS JYMCGROUP,  (CASE WHEN JYDFMCGROUPNAME IS NULL THEN JYDFMC ELSE JYDFMCGROUPNAME END) AS JYDFMCGROUP  FROM(  (SELECT * FROM ",
    TableName,
    " WHERE AJID = $AJID$ )BANK  LEFT JOIN (SELECT GROUPNAME AS CXKHGROUPNAME, GROUPMEMBER, GROUPMEMBERCOUNT AS CXKHGROUPMEMBERCOUNT FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = '",
    TableName,
    "')GROUP1 on BANK.CXKH = GROUP1.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYDFZKHGROUPNAME, GROUPMEMBER, GROUPMEMBERCOUNT AS JYDFZKHGROUPMEMBERCOUNT FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = '",
    TableName,
    "')GROUP2 on BANK.JYDFZKH = GROUP2.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYZJHMGROUPNAME, GROUPMEMBER, GROUPMEMBERCOUNT AS JYZJHMGROUPMEMBERCOUNT FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = '",
    TableName,
    "')GROUP3 on BANK.JYZJHM = GROUP3.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYDFZJHMGROUPNAME, GROUPMEMBER, GROUPMEMBERCOUNT AS JYDFZJHMGROUPMEMBERCOUNT FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = '",
    TableName,
    "')GROUP4 on BANK.JYDFZJHM = GROUP4.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYMCGROUPNAME, GROUPMEMBER, GROUPMEMBERCOUNT AS JYMCGROUPMEMBERCOUNT FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = '",
    TableName,
    "')GROUP5 on BANK.JYMC = GROUP5.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYDFMCGROUPNAME, GROUPMEMBER, GROUPMEMBERCOUNT AS JYDFMCGROUPMEMBERCOUNT FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = '",
    TableName,
    "')GROUP6 on BANK.JYDFMC = GROUP6.GROUPMEMBER  )ALLBANK)GROUPBANKTABLE"
  );
}
//数据处理类型
function DataRule(
  RULE_NAME = "",
  CurrentSelectSql = "",
  CurrentExeSql = "",
  FiltrateFieldEN = "",
  FieldType = DataType.STR
) {
  (this.FiltrateFieldEN = FiltrateFieldEN),
    (this.FieldType = FieldType),
    (this.RULE_NAME = RULE_NAME),
    (this.CurrentSelectSql = CurrentSelectSql),
    (this.CurrentExeSql = CurrentExeSql);
}
//页面ID
const DataSourceType = {
  Detail: 4,
  // Token: 0x0400063B RID: 1595
  Account: 3,
  // Token: 0x0400063C RID: 1596
  Person: 1,
  // Token: 0x0400063D RID: 1597
  Unit: 2,
  // Token: 0x0400063E RID: 1598
  TaxResgiter: 16,
  // Token: 0x0400063F RID: 1599
  TaxDetail: 14,
  // Token: 0x04000640 RID: 1600
  Alipay: 5,
  // Token: 0x04000641 RID: 1601
  PhoneCallInfo: 18,
  // Token: 0x04000642 RID: 1602
  ExchangeRate: 41,
  // Token: 0x04000643 RID: 1603
  Collect: 51,
  // Token: 0x04000644 RID: 1604
  Default: 0,
};
//比较类型
const FiltrateLogicID = {
  EqualTo: 0,
  // Token: 0x04000378 RID: 888
  NotEqualTo: 1,
  // Token: 0x04000379 RID: 889
  GreaterThan: 2,
  // Token: 0x0400037A RID: 890
  LessThan: 3,
  // Token: 0x0400037B RID: 891
  GreaterOrEqual: 4,
  // Token: 0x0400037C RID: 892
  LessOrEqual: 5,
  // Token: 0x0400037D RID: 893
  StartWith: 6,
  // Token: 0x0400037E RID: 894
  NotStartWith: 7,
  // Token: 0x0400037F RID: 895
  EndWith: 8,
  // Token: 0x04000380 RID: 896
  NotEndWith: 9,
  // Token: 0x04000381 RID: 897
  Contains: 10,
  // Token: 0x04000382 RID: 898
  NotContains: 11,
  // Token: 0x04000383 RID: 899
  NotEmpty: 14,
  // Token: 0x04000384 RID: 900
  IsEmpty: 15,
};
//数据处理类型
const DataRuleType = {
  Special: 0,
  // Token: 0x0400061A RID: 1562
  Invalid: 1,
  // Token: 0x0400061B RID: 1563
  Repeat: 2,
  // Token: 0x0400061C RID: 1564
  NoType: 3,
  // Token: 0x0400061D RID: 1565
  TbRepeat: 4,
};
//字段类型
const DataType = {
  STR: 0,
  DOUBLE: 1,
  DECIMAL: 2,
  DATATIME_1: 3, //"'YYYY-MM-DD HH24:MI:SS'"
  DATATIME_2: 4, //"'YYYY-MM-DD'"
  DATATIME_3: 5, //"'HH24:MI:SS'"
};
//筛选块
function DataFilter(NodeType_, DisplayRelation_ = "") {
  // this.count=0;
  this.children = []; //list DataFilter
  this.ConditionNodeType = NodeType_; //单一节点还是list
  this.DisplayRelation = DisplayRelation_; //且或条件   "AND"
  this.FiltrateValue = ""; //过滤值
  this.FiltrateFieldType = DataType.STR; //字段类型
  this.FiltrateFieldEN = ""; //字段名称
  this.condtion = FiltrateLogicID.EqualTo; //比较条件
}
//块类型
const NodeType = {
  NodeType_ConditionList: 1,
  NodeType_Condition: 2,
};
//三个 比较块
const FiltrateLogic = {
  List_num: [
    { FiltrateLogicCN: "等于", LogicID: FiltrateLogicID.EqualTo },
    { FiltrateLogicCN: "不等于", LogicID: FiltrateLogicID.NotEqualTo },
    { FiltrateLogicCN: "大于", LogicID: FiltrateLogicID.GreaterThan },
    { FiltrateLogicCN: "小于", LogicID: FiltrateLogicID.LessThan },
    { FiltrateLogicCN: "大于等于", LogicID: FiltrateLogicID.GreaterOrEqual },
    { FiltrateLogicCN: "小于等于", LogicID: FiltrateLogicID.LessOrEqual },
    { FiltrateLogicCN: "为空", LogicID: FiltrateLogicID.IsEmpty },
    { FiltrateLogicCN: "不为空", LogicID: FiltrateLogicID.NotEmpty },
  ],
  List_datetime: [
    { FiltrateLogicCN: "等于", LogicID: FiltrateLogicID.EqualTo },
    { FiltrateLogicCN: "不等于", LogicID: FiltrateLogicID.NotEqualTo },
    { FiltrateLogicCN: "大于", LogicID: FiltrateLogicID.GreaterThan },
    { FiltrateLogicCN: "小于", LogicID: FiltrateLogicID.LessThan },
    { FiltrateLogicCN: "大于等于", LogicID: FiltrateLogicID.GreaterOrEqual },
    { FiltrateLogicCN: "小于等于", LogicID: FiltrateLogicID.LessOrEqual },
    { FiltrateLogicCN: "开始于", LogicID: FiltrateLogicID.StartWith },
    { FiltrateLogicCN: "不开始于", LogicID: FiltrateLogicID.NotStartWith },
    { FiltrateLogicCN: "结束于", LogicID: FiltrateLogicID.EndWith },
    { FiltrateLogicCN: "不结束于", LogicID: FiltrateLogicID.NotEndWith },
    { FiltrateLogicCN: "包含", LogicID: FiltrateLogicID.Contains },
    { FiltrateLogicCN: "不包含", LogicID: FiltrateLogicID.NotContains },
    { FiltrateLogicCN: "为空", LogicID: FiltrateLogicID.IsEmpty },
    { FiltrateLogicCN: "不为空", LogicID: FiltrateLogicID.NotEmpty },
  ],
  List_else: [
    { FiltrateLogicCN: "等于", LogicID: FiltrateLogicID.EqualTo },
    { FiltrateLogicCN: "不等于", LogicID: FiltrateLogicID.NotEqualTo },
    { FiltrateLogicCN: "开始于", LogicID: FiltrateLogicID.StartWith },
    { FiltrateLogicCN: "不开始于", LogicID: FiltrateLogicID.NotStartWith },
    { FiltrateLogicCN: "结束于", LogicID: FiltrateLogicID.EndWith },
    { FiltrateLogicCN: "不结束于", LogicID: FiltrateLogicID.NotEndWith },
    { FiltrateLogicCN: "包含", LogicID: FiltrateLogicID.Contains },
    { FiltrateLogicCN: "不包含", LogicID: FiltrateLogicID.NotContains },
    { FiltrateLogicCN: "为空", LogicID: FiltrateLogicID.IsEmpty },
    { FiltrateLogicCN: "不为空", LogicID: FiltrateLogicID.NotEmpty },
  ],
};
function IsNullOrEmpty(str) {
  return str == null || str.length == 0 || str == undefined;
}
function GetTimeType(time) {
  if (datatype_3(time)) {
    return DataType.DATATIME_3;
  }
  if (datatype_2(time)) {
    return DataType.DATATIME_2;
  }
  if (datatype_1(time)) {
    return DataType.DATATIME_1;
  }
  return DataType.STR;
}
function datatype_3(time) {
  let regex = /^(([0-2][0-3])|([0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/;
  return regex.test(time.trim());
}
function datatype_2(time) {
  let regex = new RegExp(/^\d{4}\-\d{2}\-\d{2}$/);
  return regex.test(time.trim());
}
function datatype_1(time) {
  var _reTimeReg = /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/;
  return _reTimeReg.test(time.trim());
}
//时间筛选
function BackFiltrateCondtion_DateTime(
  condtion,
  vale,
  FiltrateFieldEN,
  DateTimeType
) {
  let result = "";
  let text;
  if (DateTimeType == DataType.DATATIME_1) {
    text = "'YYYY-MM-DD HH24:MI:SS'";
  } else if (DateTimeType == DataType.DATATIME_2) {
    text = "'YYYY-MM-DD'";
  } else {
    text = "'HH24:MI:SS'";
  }
  if (condtion == null) {
    return result;
  }
  if (condtion == FiltrateLogicID.GreaterThan) {
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
  } else if (condtion == FiltrateLogicID.LessThan) {
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
  } else if (condtion == FiltrateLogicID.EqualTo) {
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
  } else if (condtion == FiltrateLogicID.GreaterOrEqual) {
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
  } else if (condtion == FiltrateLogicID.IsEmpty) {
    result = "".concat(
      " ",
      FiltrateFieldEN,
      " IS NULL OR (LENGTH( COALESCE(",
      FiltrateFieldEN,
      ", '0'))<=0)"
    );
  } else if (condtion == FiltrateLogicID.NotEmpty) {
    result = "".concat(
      " ",
      FiltrateFieldEN,
      " IS NOT NULL AND (LENGTH( COALESCE(",
      FiltrateFieldEN,
      ", '0'))>0)"
    );
  } else if (condtion == FiltrateLogicID.NotEqualTo) {
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
  } else if (condtion == FiltrateLogicID.LessOrEqual) {
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

const ReportTableDic = {
  603: {
    YHKH: "银行卡号",
    HM: "户名",
    ZCZJE: "转出总金额",
    ZCZCS: "转出总次数",
    ZRZJE: "转入总金额",
    ZRZCS: "转入总次数",
    JYZJE: "交易总金额",
  },
  604: {
    JYHM: "交易户名",
    JYSFZH: "交易身份证号",
    DJYHKSM: "调集银行卡数目",
    ZCZJE: "转出总金额",
    ZCZCS: "转出总次数",
    ZRZJE: "转入总金额",
    ZRZCS: "转入总次数",
    JYZJE: "交易总金额",
  },
  605: {
    DSZKH: "对手账户",
    DSHM: "对手户名",
    ZCZJE: "转入总金额",
    ZCZCS: "转入总次数",
    ZRZJE: "转出总金额",
    ZRZCS: "转出总次数",
    JCZCJE: "进出账差额",
  },
  606: {
    DSZKH: "对手账户",
    DSHM: "对手户名",
    DSSFZH: "对手身份证号",
    GLDJRYGS: "关联调集人员个数",
  },
  607: {
    CXKH: "交易账号",
    JYDFZKH: "对手账号",
    JYDFMC: "对手户名",
    JZJE: "转入总金额",
    JZCS: "转入总笔数",
    CZJE: "转出总金额",
    CZCS: "转出总笔数",
    JCZCJE: "进出账差额",
  },
  608: {
    CXKH: "交易账号",
    JYDFZKH: "对手账号",
    JYDFMC: "对手户名",
    JZJE: "转入总金额",
    JZCS: "转入总笔数",
    CZJE: "转出总金额",
    CZCS: "转出总笔数",
    JCZCJE: "进出账差额",
  },
  609: {
    CXKH: "异常交易账户",
    JYMC: "交易户名",
    FSCS: "匹配次数",
    JZJE: "进账总额",
    CZJE: "出账总额",
  },
  610: {
    ZYSM: "摘要说明",
    JYCS: "总次数",
    JYZJE: "交易总金额",
    JZCS: "进账次数",
    JZJE: "进账金额",
    CZCS: "出账次数",
    CZJE: "出账金额 ",
  },
};
//获取当前时间
function getNowFormatDate(type = 0) {
  let date = new Date();
  let seperator1 = "-";
  let seperator2 = ":";
  let month = date.getMonth() + 1;
  let strDate = date.getDate();

  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  if (type == 1) {
    return (
      date.getFullYear() +
      seperator1 +
      month +
      seperator1 +
      strDate +
      " " +
      date.getHours() +
      seperator2 +
      date.getMinutes() +
      seperator2 +
      date.getSeconds()
    );
  }
  return date.getFullYear() + seperator1 + month + seperator1 + strDate;
}

function HashSet() {
  if (!(this instanceof HashSet)) return;

  var _data = {};
  var _length = 0;
  var _DEFAULT = new Date();

  this.contains = function(val) {
    val = val.toString();
    return !!_data[val] && _data.hasOwnProperty(val);
  };

  this.add = function(val) {
    if (!this.contains(val.toString())) {
      _length++;
    }
    _data[val.toString()] = val;
  };
  this.add = function(key, val) {
    if (!this.contains(key)) {
      _length++;
    }
    _data[key] = val;
  };

  this.remove = function(val) {
    val = val.toString();
    if (!this.contains(val)) {
      return false;
    } else {
      delete _data[val.toString()];
      _length--;
      return true;
    }
  };

  this.clear = function() {
    for (var val in _data) {
      if (_data.hasOwnProperty(val)) {
        delete _data[val];
      }
    }
    _length = 0;
  };

  this.isEmpty = function() {
    return _length === 0;
  };

  this.size = function() {
    return _length;
  };

  this.toArray = function() {
    _data.length = _length;
    var arr = Array.prototype.slice.call(_data);
    delete _data.length;
    return arr;
  };
}
//栈
function Stack() {
  this.data = []; //保存栈内元素
  this.top = 0; //记录栈顶位置

  this.push = push;
  this.pop = pop;
  this.peek = peek;

  /*辅助方法*/
  this.size = size;
  this.clear = clear_stack;
}
/*向栈中压入新元素*/
function push(element) {
  this.data[this.top++] = element;
}
/*从栈中弹出栈顶元素*/
function pop() {
  return this.data[--this.top];
}
/*预览栈顶元素，空栈返回undefined*/
function peek() {
  return this.data[this.top - 1];
}
/*获取栈内存储的元素数量*/
function size() {
  return this.top;
}
/*清空栈*/
function clear_stack() {
  this.top = 0;
}

module.exports.getNowFormatDate = getNowFormatDate;
// module.exports.Dictionary = Dictionary;
module.exports.HashSet = HashSet;
module.exports.Stack = Stack;
module.exports.FiltrateLogicID = FiltrateLogicID;
module.exports.DataFilter = DataFilter;
module.exports.DataType = DataType;
module.exports.NodeType = NodeType;
module.exports.FiltrateLogic = FiltrateLogic;
module.exports.DataSourceType = DataSourceType;
module.exports.IsNullOrEmpty = IsNullOrEmpty;
module.exports.GetBankDetailTableSql = GetBankDetailTableSumSql;
module.exports.BackFiltrateCondtion_DateTime = BackFiltrateCondtion_DateTime;
module.exports.DataRuleType = DataRuleType;
module.exports.DataRule = DataRule;
module.exports.GetTimeType = GetTimeType;
