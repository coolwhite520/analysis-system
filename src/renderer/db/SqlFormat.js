function GetBankDetailTableSql(TableName) {
  return "".concat(
    "(SELECT *, (CASE WHEN CXKHGROUPNAME IS NULL THEN CXKH ELSE CXKHGROUPNAME END) AS CXKHGROUP,  (CASE WHEN JYDFZKHGROUPNAME IS NULL THEN JYDFZKH ELSE JYDFZKHGROUPNAME END) AS JYDFZKHGROUP,  (CASE WHEN JYZJHMGROUPNAME IS NULL THEN JYZJHM ELSE JYZJHMGROUPNAME END) AS JYZJHMGROUP,  (CASE WHEN JYDFZJHMGROUPNAME IS NULL THEN JYDFZJHM ELSE JYDFZJHMGROUPNAME END) AS JYDFZJHMGROUP,  (CASE WHEN JYMCGROUPNAME IS NULL THEN JYMC ELSE JYMCGROUPNAME END) AS JYMCGROUP,  (CASE WHEN JYDFMCGROUPNAME IS NULL THEN JYDFMC ELSE JYDFMCGROUPNAME END) AS JYDFMCGROUP  FROM( (SELECT * FROM ",
    TableName,
    " WHERE AJID = $AJID$)BANK  LEFT JOIN(SELECT GROUPNAME AS CXKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = '",
    TableName,
    "')GROUP1 ON BANK.CXKH = GROUP1.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYDFZKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = '",
    TableName,
    "')GROUP2 ON BANK.JYDFZKH = GROUP2.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = '",
    TableName,
    "')GROUP3 ON BANK.JYZJHM = GROUP3.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYDFZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = '",
    TableName,
    "')GROUP4 ON BANK.JYDFZJHM = GROUP4.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = '",
    TableName,
    "')GROUP5 ON BANK.JYMC = GROUP5.GROUPMEMBER  LEFT JOIN (SELECT GROUPNAME AS JYDFMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE AJID = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = '",
    TableName,
    "')GROUP6 ON BANK.JYDFMC = GROUP6.GROUPMEMBER) ALLBANK)GROUPBANKTABLE"
  );
}
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

function GetJYQJstr(string_0, int_0) {
  let text = "";
  if (string_0 == null || string_0 == undefined || string_0 == "") {
    return text;
  }
  let array = string_0.split(",");
  for (let i = 0; i < array.length; i++) {
    if (i == 0) {
      if (int_0 == 1) {
        text = text.concat(
          "CASE WHEN JYJE< ",
          array[i],
          "0000 THEN '",
          array[i],
          "万以下' \n"
        );
      } else {
        text = text.concat(
          "CASE WHEN JYJE< ",
          array[i],
          "0000 THEN ",
          i,
          " \n"
        );
      }
    } else if (i == array.length - 1) {
      if (int_0 == 1) {
        text = text + "ELSE   '" + array[i] + "万以上' END \n";
      } else {
        text = text.concat("ELSE  ", i + 1, " END \n");
      }
    } else if (int_0 == 1) {
      text = text.concat(
        "WHEN JYJE>= ",
        array[i - 1],
        "0000  AND JYJE< ",
        array[i],
        "0000  THEN '",
        array[i - 1],
        "万-",
        array[i],
        "万' \n"
      );
    } else {
      text = text.concat(
        "WHEN JYJE>= ",
        array[i - 1],
        "0000  AND JYJE< ",
        array[i],
        "0000  THEN ",
        i,
        " \n"
      );
    }
  }
  return text;
}

export default {
  FormatSqlStr: function(
    itemSql,
    sql_OrderBy,
    selectCondition,
    caseId,
    condtion = "",
    condition_child = ""
  ) {
    try {
      let array2 = [];
      let newValue = condtion.replace(/jyje/, "JYJE");
      let newValue2 = "";
      let newValue3 = "";
      let newValue4 = "";
      let newValue5 = "";
      let newValue6 = "";
      let newValue7 = "";
      let newValue8 = "";
      let text = "";
      let text2 = "";
      let text3 = "";
      let text4 = "";
      let text5 = "";
      let text6 = "";
      let text7 = "";
      if (
        itemSql.indexOf("$KEY_PERSIONS_JYMC$") >= 0 &&
        selectCondition.KEY_PERSIONS_JYMC.Length > 0
      ) {
        array2 = selectCondition.KEY_PERSIONS_JYMC.replace(/，/, ",").split(
          ","
        );
        for (let i = 0; i < array2.Length; i++) {
          text = text + "'" + array2[i] + "',";
        }
        newValue2 = " AND JYMC IN(" + text.TrimEnd(",") + ")";
      }
      if (
        itemSql.indexOf("$KEY_PERSIONS_DFMC$") >= 0 &&
        selectCondition.KEY_PERSIONS_DFMC.Length > 0
      ) {
        array2 = selectCondition.KEY_PERSIONS_DFMC.replace(/，/, ",").split(
          ","
        );
        for (let i = 0; i < array2.Length; i++) {
          text2 = text2 + "'" + array2[i] + "',";
        }
        newValue3 = " AND JYDFMC IN(" + text2.TrimEnd(",") + ")";
      }
      if (
        itemSql.indexOf("$KEY_PERSIONS_JYZKH$") >= 0 &&
        selectCondition.KEY_PERSIONS_JYZKH.Length > 0
      ) {
        array2 = selectCondition.KEY_PERSIONS_JYZKH.replace(/，/, ",").split(
          ","
        );
        for (let i = 0; i < array2.Length; i++) {
          text3 = text3 + "'" + array2[i] + "',";
        }
        newValue4 =
          " AND (CXKH IN(" +
          text3.TrimEnd(",") +
          ") OR CXZH IN(" +
          text3.TrimEnd(",") +
          "))";
      }
      if (
        itemSql.indexOf("$KEY_PERSIONS_JYDFZKH$") >= 0 &&
        selectCondition.KEY_PERSIONS_JYDFZKH.Length > 0
      ) {
        array2 = selectCondition.KEY_PERSIONS_JYDFZKH.replace(/，/, ",").split(
          ","
        );
        for (let i = 0; i < array2.Length; i++) {
          text4 = text4 + "'" + array2[i] + "',";
        }
        newValue5 = " AND JYDFZKH IN(" + text4.TrimEnd(",") + ")";
      }
      if (
        itemSql.indexOf("$KEY_PERSIONS_JYZJHM$") >= 0 &&
        selectCondition.KEY_PERSIONS_JYZJHM.Length > 0
      ) {
        array2 = selectCondition.KEY_PERSIONS_JYZJHM.replace(/，/, ",").split(
          ","
        );
        for (let i = 0; i < array2.Length; i++) {
          text5 = text5 + "'" + array2[i] + "',";
        }
        newValue6 = " AND JYZJHM IN(" + text5.TrimEnd(",") + ")";
      }
      if (
        itemSql.indexOf("$KEY_PERSIONS_JYDFZJHM$") >= 0 &&
        selectCondition.KEY_PERSIONS_JYDFZJHM.Length > 0
      ) {
        array2 = selectCondition.KEY_PERSIONS_JYDFZJHM.replace(/，/, ",").split(
          ","
        );
        for (let i = 0; i < array2.Length; i++) {
          text6 = text6 + "'" + array2[i] + "',";
        }
        newValue7 = " AND JYDFZJHM IN(" + text6.TrimEnd(",") + ")";
      }
      if (itemSql.indexOf("$KYZT_KEYS$") >= 0) {
        if (selectCondition.KYZT.Length > 0) {
          array2 = selectCondition.KYZT.replace(/，/, ",").split(",");
          for (let i = 0; i < array2.Length; i++) {
            text7 = text7 + "'" + array2[i] + "',";
          }
          newValue8 = text7.TrimEnd(",");
        } else {
          newValue8 = "'0'";
        }
      }
      let text8 = itemSql
        .replace(
          /\$MODEL_FILTER_GROUP\$/g,
          GetBankDetailTableSql("gas_bank_records") //.replace(/\$/g,"$$$$")
        )
        .replace(
          /\$MODEL_FILTER_GROUP_SUM\$/g,
          GetBankDetailTableSumSql("gas_bank_records")
        )
        .replace(/\$AJID\$/g, caseId)
        .replace(/\${AJID}\$/g, caseId)
        .replace(/\$ZXJYJE_CONDITION\$/g, selectCondition.JYZEConditionAccord)
        .replace(/\$JYBS_CONDITION\$/g, selectCondition.JYCSConditionAccord)
        .replace(/\$MODEL_FILTER\$/g, newValue)
        .replace(/\$KEY_PERSIONS_JYMC\$/g, newValue2)
        .replace(/\$KEY_PERSIONS_DFMC\$/g, newValue3)
        .replace(/\$KEY_PERSIONS_JYZKH\$/g, newValue4)
        .replace(/\$KEY_PERSIONS_JYDFZKH\$/g, newValue5)
        .replace(/\$KEY_PERSIONS_JYZJHM\$/g, newValue6)
        .replace(/\$KEY_PERSIONS_JYDFZJHM\$/g, newValue7)
        .replace(/\$JYJE\$/g, selectCondition.JYZEValue)
        .replace(/\$JYZJE\$/g, selectCondition.JYZEValue)
        .replace(/\$ZXJYJE\$/g, selectCondition.JYZE_MINValue)
        .replace(/\$ZXJYZJE\$/g, selectCondition.JYZEValue)
        .replace(/\$ZXJZJE\$/g, selectCondition.JYZEValue)
        .replace(/\$CJBZXZ\$/g, selectCondition.JCB_MIN)
        .replace(/\$CJBZDZ\$/g, selectCondition.JCB_MAX)
        .replace(/\$JYSJQJ\$/g, selectCondition.JC_SJJG)
        .replace(/\$HLJE\$/g, "'" + selectCondition.HLJE + "'")
        .replace(/\$GLDDZHS\$/g, "'" + selectCondition.GLDDZHS + "'")
        .replace(/\$SJD\$/g, "'" + selectCondition.SJD + "'")
        .replace(/\$XSGS\$/g, "'" + selectCondition.XSGS + "'")
        .replace(/\$SORTPATH\$/g, selectCondition.XSMZ)
        .replace(/\$ZXJYZCS\$/g, "'" + selectCondition.JYCSValue + "'")
        .replace(/\$KYZT_KEYS\$/g, newValue8)
        .replace(/\$SFJEZB\$/g, "'" + selectCondition.SFJEZB.ToString + "'")
        .replace(/\$JCZCSB_MIN\$/g, "'" + selectCondition.JCZCSB_MIN + "'")
        .replace(/\$JCZCSB_MAX\$/g, "'" + selectCondition.JCZCSB_MAX + "'")
        .replace(/\$SFJEB_MIN\$/g, "'" + selectCondition.SFJEB_MIN + "'")
        .replace(/\$SFJEB_MAX\$/g, "'" + selectCondition.SFJEB_MAX + "'")
        .replace(/\$JYSJ_START\$/g, "'" + selectCondition.JYSJ_START + "'")
        .replace(/\$JYSJ_END\$/g, "'" + selectCondition.JYSJ_END + "'")
        .replace(/\$XXSJEHJ\$/g, selectCondition.XXSJEHJ)
        .replace(/\$ZCDDGLGSSL\$/g, selectCondition.ZCDDGLGSSL)
        .replace(/\$BSRGLGSSL\$/g, selectCondition.BSRGLGSSL)
        .replace(/\$CWFZRGLGSSL\$/g, selectCondition.CWFZRGLGSSL)
        .replace(/\$XFSHSL\$/g, selectCondition.XFSHSL)
        .replace(/\$GFSHSL\$/g, selectCondition.GFSHSL)
        .replace(/\$RYGLFS\$/g, selectCondition.RYGLFS)
        .replace(/\$ZXKPSJ\$/g, selectCondition.ZXKPSJ)
        .replace(/\$MODEL_FILTER_CHILD\$/g, condition_child)
        .replace(/\$SQLORDERBY\$/g, sql_OrderBy)
        .replace(
          /\$ZXJYSJ\$/g,
          "'" +
            selectCondition.MINH +
            ":" +
            selectCondition.MINM +
            ":" +
            selectCondition.MINS +
            "'"
        )
        .replace(
          /\$ZDJYSJ\$/g,
          "'" +
            selectCondition.MAXH +
            ":" +
            selectCondition.MAXM +
            ":" +
            selectCondition.MAXS +
            "'"
        )
        .replace(/\$JYQJ\$/g, GetJYQJstr(selectCondition.MoneyIntervalStr, 1))
        .replace(/\$QJXH\$/g, GetJYQJstr(selectCondition.MoneyIntervalStr, 2))
        .replace(/\$ZXJYRQ\$/g, "'" + selectCondition.MinDate + "'")
        .replace(/\$ZDJYRQ\$/g, "'" + selectCondition.MaxDate + "'")
        .replace(/\$SUMFILED\$/g, selectCondition.String_1)
        .replace(/\$SUMFILEDISNULL\$/g, selectCondition.FiledsIsNullCondition)
        .replace(
          /\$SUMFILEDTONULL\$/g,
          selectCondition.FiledsEmptyToNullCondition
        );
      //团伙选择判断
      if (selectCondition.SelectThType != null) {
        text8 = text8
          .replace(/\$GROUPNAME\$/g, selectCondition.SelectThType.ThId)
          .replace(/\$DSGROUPNAME\$/g, selectCondition.SelectThType.DsThId)
          .replace(
            /\$GROUPMEMBERCOUNT\$/g,
            selectCondition.SelectThType.ThMemberCntId
          )
          .replace(
            /\$DSGROUPMEMBERCOUNT\$/g,
            selectCondition.SelectThType.DsThMemberCntId
          );
      }
      return text8;
    } catch (e) {
      return null;
    }
  },
};

// let sss = "111$jyje$ 222";
// let a = 222;

// let ll =
//   "SELECT DISTINCT\r\n\r\n\tt1.cxkh,\r\n\r\n\tt1.jyzjhm,\r\n\r\n\tt1.jymc,\r\n\r\n\tt1.jyzje,\r\n\r\n\tt1.jyzbs,\r\n\r\n\tt1.CZJE,\r\n\r\n\tt1.CZBS,\r\n\r\n\tt1.JZJE,\r\n\r\n\tt1.JZBS,\r\n\r\n\tt1.JCZCE\r\n\r\nFROM\r\n\r\n\t(\r\n\r\nSELECT\r\n\r\n\tmax( jymc ) AS jymc,\r\n\r\n\tcxkh,\r\n\r\n\tmax( jyzjhm ) AS jyzjhm,\r\n\r\n\tmax( jyrq ) AS jyrq,\r\n\r\n\tsum( jyje ) AS jyzje,\r\n\r\n\tcount( 1 ) AS jyzbs,\r\n\r\n\tSUM(CASE JDBZ WHEN '出' THEN JYJE ELSE 0 END) AS CZJE, \r\n\r\n\tSUM(CASE JDBZ WHEN '出' THEN 1 ELSE 0 END) AS CZBS, \r\n\r\n\tSUM(CASE JDBZ WHEN '进' THEN JYJE ELSE 0 END) AS JZJE, \r\n\r\n\tSUM(CASE JDBZ WHEN '进' THEN 1 ELSE 0 END) AS JZBS, \r\n\r\n\tSUM(CASE JDBZ WHEN '进' THEN JYJE ELSE - JYJE END) AS JCZCE\r\n\r\nFROM\r\n\r\n\r\n\r\n$MODEL_FILTER_GROUP$\r\n\r\n\r\n\r\nWHERE\r\n\r\n\tajid = $AJID$ $MODEL_FILTER$ \r\n\r\n\tAND cxkh IS NOT NULL \r\n\r\nGROUP BY\r\n\r\n\tcxkh \r\n\r\nHAVING\r\n\r\n\tsum( jyje ) $ZXJYJE_CONDITION$ $ZXJYZJE$ \r\n\r\n\tAND count( 1 ) $JYBS_CONDITION$ $ZXJYZCS$ \r\n\r\n\t) t1 \r\n\r\nWHERE 1=1 $MODEL_FILTER_CHILD$  $SQLORDERBY$";
// let or = "ORDER BY jyzbs DESC";

// var qqq = FormatSqlStr(ll, or, CaseAnalyseFiltrateModel, "100", "", "");
// console.log(qqq);
// console.log(CaseAnalyseFiltrateModel.JYSJ_END);
// console.log(CaseAnalyseFiltrateModel.MaxDate);
