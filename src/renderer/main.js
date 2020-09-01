import Vue from "vue";
import axios from "axios";

import App from "./App";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";

import "./assets/theme/index.css";
// import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/iconfont.css";
import "./assets/css/animate.css";
import "echarts";
import "./utils/dialog";
import echarts from "echarts";

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(ElementUI);

Vue.prototype.$echarts = echarts;
// //去除字符串尾部空格或指定字符
// String.prototype.trim = function() {
//   return this.replace(/^\s+|\s+$/gm, "");
// };
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

// 定义全局的默认选择属性
global.defaultSelection = {
  JYZE_MINValue: 10000.0,
  JYZEValue: 1000000.0, // 注意这个值就是Double_0
  JYZECondition: "大于等于",
  JYZEConditionAccord: ">=",
  JYCSConditionAccord: ">=",
  XSMZ: "JYJE",
  JYCSCondition: "大于等于",
  JYCSValue: 10,
  XSGS: 10,
  GLDDZHS: 1,
  HLJE: 20000,
  JCB_MAX: 1.0,
  JCB_MIN: 1.0,
  JC_SJJG: 48,
  KEY_PERSIONS_DFMC: "",
  KEY_PERSIONS_JYMC: "",
  SJD: "YYYY-MM",
  SJD_CN: "月，YYYY-MM",
  XSMZPro: "",
  SFJEZB: 0.2,
  ZCDDGLGSSL: 2,
  BSRGLGSSL: 2,
  CWFZRGLGSSL: 2,
  XXSJEHJ: 50000.0,
  XFSHSL: 2,
  GFSHSL: 2,
  MINH: "00",
  MINM: "00",
  MINS: "00",
  MAXH: "23",
  MAXM: "59",
  MAXS: "59",
  MoneyIntervalStr: "1,2,5,10,20,50,100,1000,10000,10000",
  MinDate: "2010-01-01",
  MaxDate: getNowFormatDate(0),
  String_1: "CXZH,JYDFZKH,JDBZ",
  String_0: "交易账号,对手账号,借贷标志",
  JYSJ_START: "1970-01-01 00:00:00",
  JYSJ_END: getNowFormatDate(1),
  KEY_PERSIONS_JYZKH: "",
  KEY_PERSIONS_JYDFZKH: "",
  KEY_PERSIONS_JYZJHM: "",
  KEY_PERSIONS_JYDFZJHM: "",
  FILTER: "",
  RYGLFS: "",
  ZXKPSJ: 3,
  SelectThTypeIndex: 0, //团伙
  SelectThType: {
    Index: 1,
    ThId: "JYMCGROUP",
    ThName: "按主体名称划分",
    DsThId: "JYDFMCGROUP",
    ThMemberCntId: "JYMCGROUPMEMBERCOUNT",
    DsThMemberCntId: "JYDFMCGROUPMEMBERCOUNT",
  }, //this.thType[0],
  KYZT: "",
  JCZCSB_MIN: 0.1,
  JCZCSB_MAX: 10.0,
  SFJEB_MIN: 0.1,
  SFJEB_MAX: 10.0,
  SelectedSaveCondition: "",
  NodeNum: "0",
  LineNum: "0",
  SaveTime: "1970-01-01 00:00:00",
  SelectDataTableColumn: [
    {
      CFIELD: "CXZH",
      CNAME: "交易账号",
      DATA_TYPE: 0, //VARCHAR
      SHOWABLE: "Y",
      COLUMN_TYPE: 0, //NONE
    },
    {
      CFIELD: "JYDFZKH",
      CNAME: "对手账号",
      DATA_TYPE: 0,
      SHOWABLE: "Y",
      COLUMN_TYPE: 0,
    },
    {
      CFIELD: "JDBZ",
      CNAME: "借贷标志",
      DATA_TYPE: 0,
      SHOWABLE: "Y",
      COLUMN_TYPE: 0,
    },
  ],
  FiledsIsNullCondition:
    " AND CXZH IS NOT NULL AND LENGTH( COALESCE(CXZH, '0'))>0 AND JYDFZKH IS NOT NULL AND LENGTH( COALESCE(JYDFZKH, '0'))>0 AND JDBZ IS NOT NULL AND LENGTH( COALESCE(JDBZ, '0'))>0 ",
  FiledsEmptyToNullCondition:
    " CASE WHEN CXZH='' THEN NULL ELSE CXZH END AS CXZH,CASE WHEN JYDFZKH='' THEN NULL ELSE JYDFZKH END AS JYDFZKH,CASE WHEN JDBZ='' THEN NULL ELSE JDBZ END AS JDBZ ",
};

global.dataCenterTableTemplate = {
  // 人员基本信息
  personTemplate: {
    querySql: `SELECT
    $FIELDS$
  FROM
    (
      ( SELECT * FROM gas_person WHERE ( ckztlb = '01' OR ZZLX = 'z1' ) AND ajid = $AJID$ )
      P LEFT JOIN (
      SELECT
        zjhm,
        mc,
        ( CASE WHEN jybs IS NULL THEN dfjybs WHEN dfjybs IS NULL THEN jybs ELSE jybs + dfjybs END ) AS jybs 
      FROM
        (
          ( SELECT jyzjhm AS zjhm, jymc AS mc, COUNT ( jyzjhm ) AS jybs FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jyzjhm, jymc )
          A FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, COUNT ( jydfzjhm ) AS dfjybs FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jydfzjhm, jydfmc ) B USING ( ZJHM, MC ) 
        ) C 
      ) G ON P.zzhm = G.zjhm 
      AND P.khmc = G.mc
      LEFT JOIN (
      SELECT
        zjhm,
        mc,
        COUNT ( DISTINCT kh ) AS glzhs 
      FROM
        (
          ( SELECT jyzjhm AS zjhm, jymc AS mc, cxkh AS kh FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jyzjhm, jymc, cxkh ) D
          FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, jydfzkh AS kh FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jydfzjhm, jydfmc, jydfzkh ) E USING ( zjhm, mc, kh ) 
        ) F 
      GROUP BY
        zjhm,
        mc 
      ) H ON P.zzhm = H.zjhm 
      AND P.khmc = H.mc 
    ) 
  WHERE
    1 = 1 
    $FILTER$
  ORDER BY
    shard_id DESC 
    LIMIT $COUNT$ OFFSET $OFFSET$`,
    countSql: `SELECT count(*)::int count FROM  gas_person  WHERE (ckztlb='01' OR ZZLX='z1') AND ajid = $AJID$ $FILTER$`,
  },
  // 单位信息
  person2Template: {
    querySql: `SELECT
    $FIELDS$
  FROM
    (
      ( SELECT * FROM gas_person WHERE ( ckztlb = '02' OR ZZLX = 'dz1' ) AND ajid = $AJID$ )
      P LEFT JOIN (
      SELECT
        zjhm,
        mc,
        ( CASE WHEN jybs IS NULL THEN dfjybs WHEN dfjybs IS NULL THEN jybs ELSE jybs + dfjybs END ) AS jybs 
      FROM
        (
          ( SELECT jyzjhm AS zjhm, jymc AS mc, COUNT ( jyzjhm ) AS jybs FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jyzjhm, jymc )
          A FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, COUNT ( jydfzjhm ) AS dfjybs FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jydfzjhm, jydfmc ) B USING ( ZJHM, MC ) 
        ) C 
      ) G ON P.zzhm = G.zjhm 
      AND P.khmc = G.mc
      LEFT JOIN (
      SELECT
        zjhm,
        mc,
        COUNT ( DISTINCT kh ) AS glzhs 
      FROM
        (
          ( SELECT jyzjhm AS zjhm, jymc AS mc, cxkh AS kh FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jyzjhm, jymc, cxkh ) D
          FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, jydfzkh AS kh FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY jydfzjhm, jydfmc, jydfzkh ) E USING ( zjhm, mc, kh ) 
        ) F 
      GROUP BY
        zjhm,
        mc 
      ) H ON P.zzhm = H.zjhm 
      AND P.khmc = H.mc 
    ) 
  WHERE
    1 = 1 
    $FILTER$
  ORDER BY
    shard_id DESC 
    LIMIT $COUNT$ OFFSET $OFFSET$`,
    countSql: `SELECT count(*)::int count FROM  gas_person  WHERE (ckztlb='02' OR ZZLX='dz1') AND ajid = $AJID$ $FILTER$`,
  },
  // 账户信息模版
  accountTemplate: {
    querySql: `SELECT
    $FIELDS$ 
  FROM
    (
    SELECT
      *  ,
      ( CASE WHEN cxkh IS NULL THEN '未调单' ELSE'已调单' END ) AS sfdd 
    FROM
      (
        (
        SELECT
          * 
        FROM
          gas_account_info 
        WHERE
          ajid = $AJID$ 
          AND (
            LENGTH ( COALESCE ( Kh, '0' ) ) > 0 
            AND kh IS NOT NULL 
            OR LENGTH ( COALESCE ( zh, '0' ) ) > 0 
            AND zh IS NOT NULL 
          ) 
        )
        A LEFT JOIN ( SELECT cxkh FROM gas_bank_records WHERE ajid = $AJID$ GROUP BY cxkh ) B ON A.kh = B.cxkh 
      ) 
    ) C 
  WHERE
    1 = 1 $FILTER$ 
  ORDER BY
    shard_id DESC 
    LIMIT $COUNT$ OFFSET $OFFSET$`,
    countSql: `SELECT count(*)::int count FROM( SELECT *  ,(case WHEN cxkh is NULL then '未调单' else '已调单' end ) as sfdd 
    from((SELECT * FROM  gas_account_info  WHERE ajid = $AJID$  
       AND(LENGTH(coalesce(Kh, '0')) > 0 
       AND kh IS NOt NULL OR LENGTH(coalesce(zh, '0')) > 0 
       AND zh IS NOt NULL))A left join(SELECT  cxkh  FROM gas_bank_records where ajid=$AJID$  GROUP BY cxkh)B on A.kh = B.cxkh) )C WHERE 1=1  $FILTER$`,
  },
  //银行信息模版
  bankTemplate: {
    querySql: `SELECT
    $FIELDS$
  FROM
    (
    SELECT
      *,
      ( CASE WHEN CXKHGROUPNAME IS NULL THEN CXKH ELSE CXKHGROUPNAME END ) AS CXKHGROUP,
      ( CASE WHEN JYDFZKHGROUPNAME IS NULL THEN JYDFZKH ELSE JYDFZKHGROUPNAME END ) AS JYDFZKHGROUP,
      ( CASE WHEN JYZJHMGROUPNAME IS NULL THEN JYZJHM ELSE JYZJHMGROUPNAME END ) AS JYZJHMGROUP,
      ( CASE WHEN JYDFZJHMGROUPNAME IS NULL THEN JYDFZJHM ELSE JYDFZJHMGROUPNAME END ) AS JYDFZJHMGROUP,
      ( CASE WHEN JYMCGROUPNAME IS NULL THEN JYMC ELSE JYMCGROUPNAME END ) AS JYMCGROUP,
      ( CASE WHEN JYDFMCGROUPNAME IS NULL THEN JYDFMC ELSE JYDFMCGROUPNAME END ) AS JYDFMCGROUP 
    FROM
      (
        ( SELECT * FROM gas_bank_records WHERE ajid = $AJID$ ) BANK
        LEFT JOIN ( SELECT GROUPNAME AS CXKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP1 ON BANK.CXKH = GROUP1.GROUPMEMBER
        LEFT JOIN ( SELECT GROUPNAME AS JYDFZKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP2 ON BANK.JYDFZKH = GROUP2.GROUPMEMBER
        LEFT JOIN ( SELECT GROUPNAME AS JYZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP3 ON BANK.JYZJHM = GROUP3.GROUPMEMBER
        LEFT JOIN ( SELECT GROUPNAME AS JYDFZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP4 ON BANK.JYDFZJHM = GROUP4.GROUPMEMBER
        LEFT JOIN ( SELECT GROUPNAME AS JYMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP5 ON BANK.JYMC = GROUP5.GROUPMEMBER
        LEFT JOIN ( SELECT GROUPNAME AS JYDFMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP6 ON BANK.JYDFMC = GROUP6.GROUPMEMBER 
      ) ALLBANK 
    ) GROUPBANKTABLE 
  WHERE
    1 = 1 
    $FILTER$
  ORDER BY
    shard_id DESC 
    LIMIT $COUNT$ OFFSET $OFFSET$`,
    countSql: `
    SELECT COUNT
( * )::int count 
FROM
(
SELECT
  *,
  ( CASE WHEN CXKHGROUPNAME IS NULL THEN CXKH ELSE CXKHGROUPNAME END ) AS CXKHGROUP,
  ( CASE WHEN JYDFZKHGROUPNAME IS NULL THEN JYDFZKH ELSE JYDFZKHGROUPNAME END ) AS JYDFZKHGROUP,
  ( CASE WHEN JYZJHMGROUPNAME IS NULL THEN JYZJHM ELSE JYZJHMGROUPNAME END ) AS JYZJHMGROUP,
  ( CASE WHEN JYDFZJHMGROUPNAME IS NULL THEN JYDFZJHM ELSE JYDFZJHMGROUPNAME END ) AS JYDFZJHMGROUP,
  ( CASE WHEN JYMCGROUPNAME IS NULL THEN JYMC ELSE JYMCGROUPNAME END ) AS JYMCGROUP,
  ( CASE WHEN JYDFMCGROUPNAME IS NULL THEN JYDFMC ELSE JYDFMCGROUPNAME END ) AS JYDFMCGROUP 
FROM
  (
    ( SELECT * FROM gas_bank_records WHERE ajid = $AJID$ ) BANK
    LEFT JOIN ( SELECT GROUPNAME AS CXKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP1 ON BANK.CXKH = GROUP1.GROUPMEMBER
    LEFT JOIN ( SELECT GROUPNAME AS JYDFZKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP2 ON BANK.JYDFZKH = GROUP2.GROUPMEMBER
    LEFT JOIN ( SELECT GROUPNAME AS JYZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP3 ON BANK.JYZJHM = GROUP3.GROUPMEMBER
    LEFT JOIN ( SELECT GROUPNAME AS JYDFZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP4 ON BANK.JYDFZJHM = GROUP4.GROUPMEMBER
    LEFT JOIN ( SELECT GROUPNAME AS JYMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP5 ON BANK.JYMC = GROUP5.GROUPMEMBER
    LEFT JOIN ( SELECT GROUPNAME AS JYDFMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = $AJID$ AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP6 ON BANK.JYDFMC = GROUP6.GROUPMEMBER 
  ) ALLBANK 
) GROUPBANKTABLE 
WHERE
1 = 1 $FILTER$`,
  },
  taxTemplate: {
    querySql: `SELECT $FIELDS$ FROM gas_tax_records WHERE ajid = '$AJID$' $FILTER$ ORDER BY shard_id DESC LIMIT $COUNT$ OFFSET $OFFSET$`,
    countSql: `select count(1)::int count from gas_tax_records where 1=1 $FILTER$`,
  },
  otherTemplate: {
    querySql: `SELECT $FIELDS$ FROM $TABLENAME$ WHERE ajid = '$AJID$' $FILTER$ ORDER BY shard_id DESC LIMIT $COUNT$ OFFSET $OFFSET$`,
    countSql: `select count(1)::int count from $TABLENAME$ where 1=1 $FILTER$`,
  },
};

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>",
}).$mount("#app");
