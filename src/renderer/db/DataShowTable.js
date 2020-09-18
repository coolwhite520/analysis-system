import cases from "./Cases";
const log = require("@/utils/log");
function getSameFieldArray(arr1, arr2) {
  var arr = [];
  if (arr1.length > arr2.length) {
    for (var i in arr1) {
      if (arr2.indexOf(arr1[i]) != "-1") {
        if (arr.indexOf(arr1[i]) == "-1") {
          arr.push(arr1[i]);
        }
      }
    }
  } else {
    for (var i in arr2) {
      if (arr1.indexOf(arr2[i]) != "-1") {
        if (arr.indexOf(arr2[i]) == "-1") {
          arr.push(arr2[i]);
        }
      }
    }
  }
  return arr;
}

const dataCenterTableTemplate = {
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
export default {
  // 根据tid获取显示的列名称list
  QueryTableShowCFields: async function(tid) {
    try {
      await cases.SwitchDefaultCase();
      let sql = `SELECT cname as fieldcname, lower(cfield) as fieldename, cid, showrightbtn_type, link_mid::int, data_type FROM icap_base.layout_table_column
       WHERE TID='${tid}' and (SHOWABLE is null or SHOWABLE ='Y')  
      ORDER BY thesort ASC;`;
      let result = await global.pool.query(sql);
      return { success: true, rows: result.rows };
    } catch (e) {
      log.error(e);
      return { success: false, msg: e.message };
    }
  },

  // 查询所有的基础表的信息
  QueryBaseTableData: async function(
    ajid,
    tid,
    tableename,
    filter,
    offset,
    count
  ) {
    try {
      let ret = await this.QueryTableShowCFields(tid);
      let headers = ret.rows;
      let showFields = [];
      for (let item of headers) {
        showFields.push(item.fieldename.toLowerCase());
      }
      await cases.SwitchCase(ajid);

      let querySqlTemp = "";
      let countSqlTemp = "";

      switch (tid) {
        case "1": //个人
          querySqlTemp = dataCenterTableTemplate.personTemplate.querySql;
          countSqlTemp = dataCenterTableTemplate.personTemplate.countSql;
          break;
        case "2": // 单位
          querySqlTemp = dataCenterTableTemplate.person2Template.querySql;
          countSqlTemp = dataCenterTableTemplate.person2Template.countSql;
          break;
        case "3":
          querySqlTemp = dataCenterTableTemplate.accountTemplate.querySql;
          countSqlTemp = dataCenterTableTemplate.accountTemplate.countSql;
          break;
        case "4":
          querySqlTemp = dataCenterTableTemplate.bankTemplate.querySql;
          countSqlTemp = dataCenterTableTemplate.bankTemplate.countSql;
          break;
        case "14":
          querySqlTemp = dataCenterTableTemplate.taxTemplate.querySql;
          countSqlTemp = dataCenterTableTemplate.taxTemplate.countSql;
          break;
        default:
          querySqlTemp = dataCenterTableTemplate.otherTemplate.querySql;
          countSqlTemp = dataCenterTableTemplate.otherTemplate.countSql;
          break;
      }
      let querySql = querySqlTemp
        .replace(/\$AJID\$/g, ajid)
        .replace(/\$FIELDS\$/g, showFields)
        .replace(/\$TABLENAME\$/g, tableename)
        .replace(/\$FILTER\$/g, filter)
        .replace(/\$COUNT\$/g, count)
        .replace(/\$OFFSET\$/g, offset);

      let exportSql = querySqlTemp
        .replace(/\$AJID\$/g, ajid)
        .replace(/\$FIELDS\$/g, showFields)
        .replace(/\$TABLENAME\$/g, tableename)
        .replace(/\$FILTER\$/g, filter)
        .replace(/\$COUNT\$/g, 100000)
        .replace(/\$OFFSET\$/g, 0);

      let countSql = countSqlTemp
        .replace(/\$AJID\$/g, ajid)
        .replace(/\$FIELDS\$/g, showFields)
        .replace(/\$FILTER\$/g, filter)
        .replace(/\$TABLENAME\$/g, tableename);

      let result = await global.pool.query(querySql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = {};
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let cell = { value, error: false };
            newRow[k] = cell;
          }
        }
        retRows.push(newRow);
      }

      // 查询结果集的总量
      let resultCount = await global.pool.query(countSql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      return { success: true, headers, rows: retRows, sum, exportSql };
    } catch (e) {
      log.error(e);
      return { success: false, msg: e.message };
    }
  },
  // 执行模型并获取结果集
  QueryDataTableBySql: async function(ajid, tid, sql, offset, count) {
    try {
      let { rows } = await this.QueryTableShowCFields(tid);
      let headers = rows;
      let showFields = [];
      for (let item of headers) {
        showFields.push(item.fieldename.toLowerCase());
      }
      await cases.SwitchCase(ajid);
      let exportSql = sql;
      let result = await global.pool.query(sql);
      // 数据过滤
      let resultFields = [];
      for (let item of result.fields) {
        resultFields.push(item.name.toLowerCase());
      }
      // 根据展示列和结果列的数组获取相同的元素数组作为headers
      showFields = getSameFieldArray(showFields, resultFields);
      let newHeaders = [];
      for (let header of headers) {
        if (showFields.includes(header.fieldename.toLowerCase())) {
          newHeaders.push(header);
        }
      }
      let retRows = [];
      let sum = result.rows.length;
      if (sum === 0) {
        return {
          success: true,
          headers: newHeaders,
          rows: retRows,
          sum,
          exportSql,
        };
      }
      for (let index = offset; index < offset + count; index++) {
        if (sum < index + 1) {
          break;
        }
        let row = result.rows[index];
        let newRow = {};
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let cell = { value, error: false, link: false };
            newRow[k] = cell;
          }
        }
        retRows.push(newRow);
      }
      return {
        success: true,
        headers: newHeaders,
        rows: retRows,
        sum,
        exportSql,
      };
    } catch (e) {
      log.error(e);
      return { success: false, msg: e.message };
    }
  },
};
