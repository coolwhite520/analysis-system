import db from "./db";
import cases from "./Cases";
export default {
  // 根据tid获取显示的列名称list
  QueryTableShowCFields: async function(tid) {
    try {
      await cases.SwitchDefaultCase();
      let sql = `SELECT cname as fieldcname, cfield as fieldename FROM icap_base.layout_table_column
       WHERE TID='${tid}' and (SHOWABLE is null or SHOWABLE ='Y')  
      ORDER BY thesort ASC;`;
      console.log(sql);
      let result = await db.query(sql);
      return { success: true, rows: result.rows };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 查询人员基本信息表
  QueryPersonBaseDataFromTableName: async function(
    ajid,
    tid,
    tablename,
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

      let sql = `SELECT
      ${showFields}
    FROM
      (
        ( SELECT * FROM gas_person WHERE ( ckztlb = '01' OR ZZLX = 'z1' ) AND ajid = ${ajid} )
        P LEFT JOIN (
        SELECT
          zjhm,
          mc,
          ( CASE WHEN jybs IS NULL THEN dfjybs WHEN dfjybs IS NULL THEN jybs ELSE jybs + dfjybs END ) AS jybs 
        FROM
          (
            ( SELECT jyzjhm AS zjhm, jymc AS mc, COUNT ( jyzjhm ) AS jybs FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jyzjhm, jymc )
            A FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, COUNT ( jydfzjhm ) AS dfjybs FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jydfzjhm, jydfmc ) B USING ( ZJHM, MC ) 
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
            ( SELECT jyzjhm AS zjhm, jymc AS mc, cxkh AS kh FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jyzjhm, jymc, cxkh ) D
            FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, jydfzkh AS kh FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jydfzjhm, jydfmc, jydfzkh ) E USING ( zjhm, mc, kh ) 
          ) F 
        GROUP BY
          zjhm,
          mc 
        ) H ON P.zzhm = H.zjhm 
        AND P.khmc = H.mc 
      ) 
    WHERE
      1 = 1 
    ORDER BY
      shard_id DESC 
      LIMIT ${count} OFFSET ${offset}`;
      console.log(sql);
      let result = await db.query(sql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = [];
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let key = k;
            let cell = { key, value, error: false };
            newRow.push(cell);
          }
        }
        retRows.push(newRow);
      }
      // 查询结果集的总量
      sql = `SELECT count(*)::int count FROM  gas_person  WHERE (ckztlb='01' OR ZZLX='z1') AND ajid = ${ajid} `;
      console.log(sql);
      let resultCount = await db.query(sql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 查询单位基本信息表
  QueryPerson2BaseDataFromTableName: async function(
    ajid,
    tid,
    tablename,
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

      let sql = `SELECT
      ${showFields} 
    FROM
      (
        ( SELECT * FROM gas_person WHERE ( ckztlb = '02' OR ZZLX = 'dz1' ) AND ajid = ${ajid} )
        P LEFT JOIN (
        SELECT
          zjhm,
          mc,
          ( CASE WHEN jybs IS NULL THEN dfjybs WHEN dfjybs IS NULL THEN jybs ELSE jybs + dfjybs END ) AS jybs 
        FROM
          (
            ( SELECT jyzjhm AS zjhm, jymc AS mc, COUNT ( jyzjhm ) AS jybs FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jyzjhm, jymc )
            A FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, COUNT ( jydfzjhm ) AS dfjybs FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jydfzjhm, jydfmc ) B USING ( ZJHM, MC ) 
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
            ( SELECT jyzjhm AS zjhm, jymc AS mc, cxkh AS kh FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jyzjhm, jymc, cxkh ) D
            FULL JOIN ( SELECT jydfzjhm AS zjhm, jydfmc AS mc, jydfzkh AS kh FROM gas_bank_records WHERE ajid = ${ajid} GROUP BY jydfzjhm, jydfmc, jydfzkh ) E USING ( zjhm, mc, kh ) 
          ) F 
        GROUP BY
          zjhm,
          mc 
        ) H ON P.zzhm = H.zjhm 
        AND P.khmc = H.mc 
      ) 
    WHERE
      1 = 1 
    ORDER BY
      shard_id DESC 
      LIMIT ${count} OFFSET ${offset}`;
      console.log(sql);
      let result = await db.query(sql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = [];
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let key = k;
            let cell = { key, value, error: false };
            newRow.push(cell);
          }
        }
        retRows.push(newRow);
      }
      // 查询结果集的总量
      sql = `SELECT count(*)::int count FROM  gas_person  WHERE (ckztlb='02' OR ZZLX='dz1') AND ajid = ${ajid} `;
      console.log(sql);
      let resultCount = await db.query(sql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 查询人员基本信息表
  QueryAccountDataFromTableName: async function(
    ajid,
    tid,
    tablename,
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

      let sql = `SELECT ${showFields} FROM( SELECT *  ,(case WHEN cxkh is NULL then '未调单' else '已调单' end ) as sfdd 
      from((SELECT * FROM  gas_account_info  WHERE ajid = ${ajid}   AND(LENGTH(coalesce(Kh, '0')) > 0 
      AND kh IS NOt NULL OR LENGTH(coalesce(zh, '0')) > 0 
      AND zh IS NOt NULL))A left join(SELECT  cxkh  
        FROM gas_bank_records where ajid= ${ajid}  
        GROUP BY cxkh)B on A.kh = B.cxkh) )C WHERE 1=1   
       ORDER BY shard_id DESC  LIMIT ${count} OFFSET ${offset} `;
      console.log(sql);
      let result = await db.query(sql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = [];
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let key = k;
            let cell = { key, value, error: false };
            newRow.push(cell);
          }
        }
        retRows.push(newRow);
      }
      // 查询结果集的总量
      sql = `SELECT count(*)::int count FROM( SELECT *  ,(case WHEN cxkh is NULL then '未调单' else '已调单' end ) as sfdd 
      from((SELECT * FROM  gas_account_info  WHERE ajid = ${ajid}  
         AND(LENGTH(coalesce(Kh, '0')) > 0 
         AND kh IS NOt NULL OR LENGTH(coalesce(zh, '0')) > 0 
         AND zh IS NOt NULL))A left join(SELECT  cxkh  FROM gas_bank_records where ajid=${ajid}  GROUP BY cxkh)B on A.kh = B.cxkh) )C WHERE 1=1  `;
      console.log(sql);
      let resultCount = await db.query(sql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  QueryBankDetaiFromTableName: async function(
    ajid,
    tid,
    tablename,
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

      let sql = `SELECT
      ${showFields} 
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
          ( SELECT * FROM gas_bank_records WHERE ajid = ${ajid} ) BANK
          LEFT JOIN ( SELECT GROUPNAME AS CXKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP1 ON BANK.CXKH = GROUP1.GROUPMEMBER
          LEFT JOIN ( SELECT GROUPNAME AS JYDFZKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP2 ON BANK.JYDFZKH = GROUP2.GROUPMEMBER
          LEFT JOIN ( SELECT GROUPNAME AS JYZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP3 ON BANK.JYZJHM = GROUP3.GROUPMEMBER
          LEFT JOIN ( SELECT GROUPNAME AS JYDFZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP4 ON BANK.JYDFZJHM = GROUP4.GROUPMEMBER
          LEFT JOIN ( SELECT GROUPNAME AS JYMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP5 ON BANK.JYMC = GROUP5.GROUPMEMBER
          LEFT JOIN ( SELECT GROUPNAME AS JYDFMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP6 ON BANK.JYDFMC = GROUP6.GROUPMEMBER 
        ) ALLBANK 
      ) GROUPBANKTABLE 
    WHERE
      1 = 1 
    ORDER BY
      shard_id DESC 
      LIMIT ${count} OFFSET ${offset}`;
      console.log(sql);
      let result = await db.query(sql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = [];
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let key = k;
            let cell = { key, value, error: false };
            newRow.push(cell);
          }
        }
        retRows.push(newRow);
      }
      // 查询结果集的总量
      sql = `
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
			( SELECT * FROM gas_bank_records WHERE ajid = ${ajid} ) BANK
			LEFT JOIN ( SELECT GROUPNAME AS CXKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP1 ON BANK.CXKH = GROUP1.GROUPMEMBER
			LEFT JOIN ( SELECT GROUPNAME AS JYDFZKHGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'CXKH&JYDFZKH' AND TABLENAME = 'gas_bank_records' ) GROUP2 ON BANK.JYDFZKH = GROUP2.GROUPMEMBER
			LEFT JOIN ( SELECT GROUPNAME AS JYZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP3 ON BANK.JYZJHM = GROUP3.GROUPMEMBER
			LEFT JOIN ( SELECT GROUPNAME AS JYDFZJHMGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYZJHM&JYDFZJHM' AND TABLENAME = 'gas_bank_records' ) GROUP4 ON BANK.JYDFZJHM = GROUP4.GROUPMEMBER
			LEFT JOIN ( SELECT GROUPNAME AS JYMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP5 ON BANK.JYMC = GROUP5.GROUPMEMBER
			LEFT JOIN ( SELECT GROUPNAME AS JYDFMCGROUPNAME, GROUPMEMBER FROM mark_group_detail WHERE ajid = ${ajid} AND TABLECOLUMN = 'JYMC&JYDFMC' AND TABLENAME = 'gas_bank_records' ) GROUP6 ON BANK.JYDFMC = GROUP6.GROUPMEMBER 
		) ALLBANK 
	) GROUPBANKTABLE 
WHERE
	1 = 1;
      `;
      console.log(sql);
      let resultCount = await db.query(sql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  QueryTaxFromTableName: async function(ajid, tid, tablename, offset, count) {
    try {
      let ret = await this.QueryTableShowCFields(tid);
      let headers = ret.rows;
      let showFields = [];
      for (let item of headers) {
        showFields.push(item.fieldename.toLowerCase());
      }
      await cases.SwitchCase(ajid);

      let sql = `SELECT ${showFields} FROM gas_tax_records WHERE ajid = '${ajid}'  ORDER BY shard_id DESC LIMIT ${count} OFFSET ${offset} `;
      console.log(sql);
      let result = await db.query(sql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = [];
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let key = k;
            let cell = { key, value, error: false };
            newRow.push(cell);
          }
        }
        retRows.push(newRow);
      }
      // 查询结果集的总量
      sql = `select count(1)::int count from gas_tax_records where 1=1 `;
      console.log(sql);
      let resultCount = await db.query(sql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  QueryOthersFromTableName: async function(
    ajid,
    tid,
    tablename,
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

      let sql = `SELECT ${showFields} FROM  ${tablename} WHERE ajid = '${ajid}'  ORDER BY shard_id DESC LIMIT ${count} OFFSET ${offset} `;
      console.log(sql);
      let result = await db.query(sql);
      // 数据过滤
      let retRows = [];
      for (let row of result.rows) {
        let newRow = [];
        for (let k in row) {
          if (showFields.includes(k)) {
            let value = row[k];
            let key = k;
            let cell = { key, value, error: false };
            newRow.push(cell);
          }
        }
        retRows.push(newRow);
      }
      // 查询结果集的总量
      sql = `select count(1)::int count from ${tablename} where 1=1 `;
      console.log(sql);
      let resultCount = await db.query(sql);
      let sum = 0;
      if (resultCount.rows.length > 0) {
        sum = resultCount.rows[0].count;
      }
      console.log(showFields);
      return { success: true, headers, rows: retRows, sum };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
};
