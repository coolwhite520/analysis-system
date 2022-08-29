import moment from "moment";
import cases from "./Cases";
const log = require("electron-log");
const uuid = require("uuid");
var crypto = require("crypto");

export default {
  // 根据导入数据类型获取对应的匹配表
  QueryMatchTableListByPdm: async function (pdm) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `select *  from  st_data_template  where pdm='${pdm}' order by MBMC;`;
      const res = await client.query(sql);
      return res.rows; // id, mbdm, mbmc, tablename ...
    } finally {
      client.release();
    }
  },

  // 根据模版代码获取对应的列名称
  QueryColsNameByMbdm: async function (mbdm) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT ID, MBDM, TABLEENAME, FIELDCNAME, FIELDENAME, FIELDTYPE, fieldlength FROM st_data_template_field where MBDM = '${mbdm}' order by FIELDCNAME asc `;

      const res = await client.query(sql);
      return res.rows; // id, fieldcname, fieldename, ...
    } finally {
      client.release();
    }
  },
  // 根据模版代码获取log表对应的列名称
  QueryInfoFromLogMatchByMbdm: async function (mbdm) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT ID, MBDM, COLUMNNAME,FIELDNAME FROM mz_match_log where MBDM = '${mbdm}'`;
      const res = await client.query(sql);
      return res.rows; // id, fieldcname, fieldename, ...
    } finally {
      client.release();
    }
  },
  // 自动匹配字段
  // ,账号开户银行,账号开户日期,账号开户名称,银行账号,通信地址,联系电话,开户人证件类型,开户人证件号码,开户人国籍,开户联系方式,代理人电话,代理人,,
  QueryBestMatchMbdm: async function (pdm, fileFields) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = "";
      if (pdm.length > 0) {
        sql = `SELECT count(*),mbdm from (SELECT fieldcname, tableename,mbdm  from (SELECT  fieldcname, tableename,mbdm from  
        st_data_template_createfield  union SELECT fieldcname, tableename, mbdm from 
        st_data_template_field union SELECT columnname as fieldcname, 'ff' as tableename,mbdm  from  mz_match_log)D where mbdm  in 
      (SELECT mbdm FROM st_data_template A INNER JOIN layout_table_info B on      
        (upper(B.tablename)=upper(A.tablecname)  or upper(B.tablename||'_source')=upper(A.tablecname) ) 
         where pdm='${pdm}'
         AND tablecname is not null AND tablecname != '' and ishide='0' and     
        ('200'=any(regexp_split_to_array(B.menu_vids,','))=TRUE or '0'=any(regexp_split_to_array(B.menu_vids,','))=TRUE )  GROUP BY(mbdm,mbmc,pdm) ORDER BY pdm 
         ) AND position(','||fieldcname||',' in '${fileFields}' )> 0 ORDER BY tableename)B GROUP BY B.mbdm ORDER BY count desc;`;
      } else {
        sql = `SELECT count(*),mbdm from (SELECT fieldcname, tableename,mbdm  from (SELECT  fieldcname, tableename,mbdm from  
        st_data_template_createfield  union SELECT fieldcname, tableename, mbdm from 
        st_data_template_field union SELECT columnname as fieldcname, 'ff' as tableename,mbdm  from  mz_match_log)D where mbdm  in 
      (SELECT mbdm FROM st_data_template A INNER JOIN layout_table_info B on      
        (upper(B.tablename)=upper(A.tablecname)  or upper(B.tablename||'_source')=upper(A.tablecname) ) 
         where tablecname is not null AND tablecname != '' and ishide='0' and     
        ('200'=any(regexp_split_to_array(B.menu_vids,','))=TRUE or '0'=any(regexp_split_to_array(B.menu_vids,','))=TRUE )  GROUP BY(mbdm,mbmc,pdm) ORDER BY pdm 
         ) AND position(','||fieldcname||',' in '${fileFields}' )> 0 ORDER BY tableename)B GROUP BY B.mbdm ORDER BY count desc;`;
      }
      let mbdm = "";
      const res = await client.query(sql);
      if (res.rows.length > 0) {
        mbdm = res.rows[0].mbdm;
        if (pdm === "") {
          sql = `select pdm from st_data_template where mbdm='${mbdm}'`;
          let ret = await client.query(sql);
          pdm = ret.rows[0].pdm;
        }
        return { mbdm, pdm };
      }
      return { mbdm: "", pdm: "" };
    } finally {
      client.release();
    }
  },
  // fileExt --> 不包含.
  insertBatch: async function (
    ajid,
    ajmc,
    fileExt,
    filename,
    filepath,
    mbdm,
    batch,
    sheetname,
    mbmc,
    tablecname,
    softVersion
  ) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      ajid = parseInt(ajid);
      let now = new Date().Format("yyyy-MM-dd hh:mm:ss");
      let sql = `INSERT INTO "icap_base"."st_data_source"("sjly", "jh", "drrq", "ajid", "jgid", 
      "ajmc", "filetype", "filename", "filepath", "mbdm", "batch", "sjl", "fl", "md5", "erropath", 
      "sheetname", "name", "mbmc", "tablecname", "versionsnum") VALUES 
      ('', '00009527', '${now}', ${ajid}, '', '${ajmc}', '${fileExt}', '${filename}',
       '${filepath}', '${mbdm}', ${batch}, 0, 0, '', '', '${sheetname}', 
       '小白', '${mbmc}', '${tablecname}', '${softVersion}') returning sjlyid;`;
      const res = await client.query(sql);
      return res.rows[0].sjlyid;
    } catch (err) {
      console.log("insertBatch:", err)
    }
    finally {
      client.release();
    }
  },
  // 查询scheme下的所有表名称
  showLikeTempTableCount: async function (ajid, like) {
    const client = await global.pool.connect();
    try {
      let sql = `SELECT count(table_name)::int count FROM information_schema.tables
      WHERE table_schema = 'icap_${ajid}' 
      and table_name like '%${like}%' 
      and POSITION ( '_temp' IN TABLE_NAME ) > 0;`;
      const res = await client.query(sql);
      return res.rows[0].count;
    } finally {
      client.release();
    }
  },
  // 数据导入的时候创建临时表
  createTempTable: async function (ajid, tablecname, mbdm, fields) {
    const client = await global.pool.connect();
    try {
      if (tablecname.endsWith("_source")) {
        tablecname = tablecname.slice(0, tablecname.lastIndexOf("_source"));
      }
      let like = `${tablecname}`;
      let valueName = uuid.v1();
      valueName = valueName.replace(/-/g, "");
      let createTableName = `${like}_${valueName}_temp`;
      // 查询全字段
      await cases.SwitchDefaultCase(client);
      let createFields = JSON.parse(JSON.stringify(fields));
      let allFieldRows = await this.QueryColsNameByMbdm(mbdm);
      for (let fieldRow of allFieldRows) {
        if (!createFields.includes(fieldRow.fieldename.toLowerCase())) {
          createFields.push(fieldRow.fieldename.toLowerCase());
        }
      }
      let newFields = createFields.map(function (item) {
        return `"${item}" varchar(1000)`;
      });
      let fieldsStr = newFields.join(",");
      await cases.SwitchCase(client, ajid);
      let sql = `DROP TABLE IF EXISTS ${createTableName};
      CREATE TABLE IF NOT EXISTS ${createTableName} (${fieldsStr})`;
      const res = await client.query(sql);
      return { createTableName, createFields };
    } catch (err) {
      console.log("createTempTable: ", err)
    }
    finally {
      client.release();
    }
  },
  deleteTempTable: async function (ajid, tempTableName) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `DROP TABLE IF EXISTS ${tempTableName};`;
      await client.query(sql);
    } finally {
      client.release();
    }
  },

  // 查询temp表中的数据
  queryDataFromTable: async function (
    ajid,
    tableName,
    matchedFields,
    beginIndex,
    limit,
    filterList,
    headers // 包含字段的所有属性
  ) {
    const client = await global.pool.connect();
    // 展示的时候需要行号， 所以查询的时候需要添加到select中
    let matchedFieldsNew = ["rownum"].concat(matchedFields);
    let newRows = [];
    let errorFields = [];
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `select ${matchedFieldsNew} from ${tableName}`;
      if (filterList.length === 0) {
        sql = sql + ` limit ${limit} OFFSET ${beginIndex}`;
        const res = await client.query(sql);
        let rows = res.rows;
        for (let row of rows) {
          let newRow = [];
          for (let k in row) {
            let value = row[k];
            let key = k;
            let error = false; //这个地方需要判定
            let cell = { key, value, error };
            newRow.push(cell);
          }
          newRows.push(newRow);
        }
      } else {
        let taskArray = [];
        for (let matchedField of matchedFields) {
          let arr = headers.filter((el) => el.fieldename === matchedField);
          if (arr.length === 0) continue;
          let item = arr[0];
          if (item.fieldtype === 1) {
            taskArray.push(
              (async () => {
                let temp = await this.QueryFieldExceedLengthRows(
                  ajid,
                  tableName,
                  matchedFieldsNew,
                  item.fieldename,
                  item.fieldlength
                );
                if (temp.success && temp.rows.length > 0) {
                  let rownums = [];
                  for (let row of temp.rows) {
                    let newRow = [];
                    rownums.push(row["rownum"]);
                    if (rownums.length === 1) {
                      for (let k in row) {
                        let value = row[k];
                        let key = k;
                        let error =
                          key.toLowerCase() === item.fieldename.toLowerCase()
                            ? true
                            : false; //这个地方需要判定

                        let cell = { key, value, error };
                        newRow.push(cell);
                      }
                      newRows.push(newRow);
                    }
                  }
                  return {
                    filterName: "exceedLen",
                    fieldcname: item.fieldcname,
                    fieldlength: item.fieldlength,
                    fieldename: item.fieldename.toLowerCase(),
                    rownums,
                  };
                }
                return null;
              })()
            );
          } else if (item.fieldtype === 2 || item.fieldtype === 3) {
            // if (item.fieldename.toUpperCase() === "JYJE") {
            //   taskArray.push(
            //     (async () => {
            //       let temp = await this.QueryJyjeMoreThanZero(
            //         ajid,
            //         tableName,
            //         matchedFieldsNew,
            //         item.fieldename
            //       );
            //       if (temp.success && temp.rows.length > 0) {
            //         let rownums = [];
            //         for (let row of temp.rows) {
            //           let newRow = [];
            //           rownums.push(row["rownum"]);
            //           if (rownums.length === 1) {
            //             // 只要一行示例错误
            //             for (let k in row) {
            //               let value = row[k];
            //               let key = k;
            //               let error =
            //                 key.toLowerCase() === item.fieldename.toLowerCase()
            //                   ? true
            //                   : false; //这个地方需要判定

            //               let cell = { key, value, error };
            //               newRow.push(cell);
            //             }
            //             newRows.push(newRow);
            //           }
            //         }
            //         return {
            //           filterName: "JyjeNotBiggerThanZero",
            //           fieldcname: item.fieldcname,
            //           fieldename: item.fieldename.toLowerCase(),
            //           rownums,
            //         };
            //       }
            //       return null;
            //     })()
            //   );
            // }
            taskArray.push(
              (async () => {
                let temp = await this.QueryFieldNotNumberRows(
                  ajid,
                  tableName,
                  matchedFieldsNew,
                  item.fieldename
                );
                if (temp.success && temp.rows.length > 0) {
                  let rownums = [];
                  for (let row of temp.rows) {
                    let newRow = [];
                    rownums.push(row["rownum"]);
                    if (rownums.length === 1) {
                      // 只要一行示例错误
                      for (let k in row) {
                        let value = row[k];
                        let key = k;
                        let error =
                          key.toLowerCase() === item.fieldename.toLowerCase()
                            ? true
                            : false; //这个地方需要判定

                        let cell = { key, value, error };
                        newRow.push(cell);
                      }
                      newRows.push(newRow);
                    }
                  }
                  return {
                    filterName: "notNum",
                    fieldcname: item.fieldcname,
                    fieldename: item.fieldename.toLowerCase(),
                    rownums,
                  };
                }
                return null;
              })()
            );
          } else if (item.fieldtype === 4 /*|| item.fieldtype === 6*/) {
            taskArray.push(
              (async () => {
                let temp = await this.QueryFieldNotDateRows(
                  ajid,
                  tableName,
                  matchedFieldsNew,
                  item.fieldename
                );
                if (temp.success && temp.rows.length > 0) {
                  let rownums = [];
                  for (let row of temp.rows) {
                    rownums.push(row["rownum"]);
                    if (rownums.length === 1) {
                      let newRow = [];
                      for (let k in row) {
                        let value = row[k];
                        let key = k;
                        let error =
                          key.toLowerCase() === item.fieldename.toLowerCase()
                            ? true
                            : false; //这个地方需要判定

                        let cell = { key, value, error };
                        newRow.push(cell);
                      }
                      newRows.push(newRow);
                    }
                  }
                  return {
                    filterName: "notDate",
                    fieldcname: item.fieldcname,
                    fieldename: item.fieldename.toLowerCase(),
                    rownums,
                  };
                }
                return null;
              })()
            );
          }
        }
        console.log(taskArray.length);
        errorFields = await Promise.all(taskArray);
        errorFields = errorFields.filter((el) => el !== null);
        log.info({
          totalCount: global.pool.totalCount,
          idleCount: global.pool.idleCount,
          waitingCount: global.pool.waitingCount,
        });
      }
      //格式化数据
      return { rows: newRows, success: true, errorFields };
    } finally {
      client.release();
    }
  },
  // 查询条目数量
  queryRowsum: async function (ajid, tableName) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `select count(*)::int count from ${tableName}`;
      const res = await client.query(sql);
      return res.rows[0].count;
    } finally {
      client.release();
    }
  },
  // 查询交易金额必须大于0
  QueryJyjeMoreThanZero: async function (
    ajid,
    tableName,
    matchedFields,
    fieldName
  ) {
    const client = await global.pool.connect();
    let success = true;
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} WHERE 1=1  and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !='' and  icap_base.isnumeric(${fieldName}) and to_number(${fieldName}, '9999999999999999999') = 0;`;
      // log.info(sql);
      console.log(sql);
      let res = await client.query(sql);
      let rows = res.rows;
      let sqlCount = `SELECT count(*) from ${tableName} WHERE 1=1 and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !='' and  icap_base.isnumeric(${fieldName}) and to_number(${fieldName}, '9999999999999999999') = 0;`;
      res = await client.query(sqlCount);
      let count = res.rows[0].count;
      return {
        rows,
        count,
        success,
      };
    } finally {
      client.release();
    }
  },
  // 查询不是数的条目
  QueryFieldNotNumberRows: async function (
    ajid,
    tableName,
    matchedFields,
    fieldName
  ) {
    const client = await global.pool.connect();
    let success = true;
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} WHERE 1=1  and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !='' and not icap_base.isnumeric(${fieldName});`;
      let res = await client.query(sql);
      let rows = res.rows;
      let sqlCount = `SELECT count(*) from ${tableName} WHERE 1=1 and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !='' and not icap_base.isnumeric(${fieldName}) `;
      res = await client.query(sqlCount);
      let count = res.rows[0].count;
      return {
        rows,
        count,
        success,
      };
    } finally {
      client.release();
    }
  },
  // 查询字段的长度不合法的条目
  QueryFieldExceedLengthRows: async function (
    ajid,
    tableName,
    matchedFields,
    fieldName,
    fieldLength
  ) {
    const client = await global.pool.connect();
    let success = true;
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} WHERE LENGTH(TRIM(both '  ' FROM ${fieldName}))>${fieldLength};`;
      if (fieldLength == 50) console.log(sql);
      let res = await client.query(sql);
      let rows = res.rows;
      let sqlCount = `SELECT count(*)::int count from ${tableName} WHERE LENGTH(TRIM(both '  ' FROM ${fieldName}))>${fieldLength} ;`;
      res = await client.query(sqlCount);
      let count = res.rows[0].count;
      return { rows, success, count };
    } finally {
      client.release();
    }
  },
  // 查询字段非日期的条目
  QueryFieldNotDateRows: async function (
    ajid,
    tableName,
    matchedFields,
    fieldName
  ) {
    const client = await global.pool.connect();
    let success = true;
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} 
      WHERE not icap_base.istimestamp(TRIM(both '  ' FROM ${fieldName})) 
      and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !=''; `; // 查找一个示例
      // log.info(sql);
      let res = await client.query(sql);
      let rows = res.rows;
      let sqlCount = `SELECT count(*)::int count from ${tableName} 
      WHERE not icap_base.istimestamp(TRIM(both '  ' FROM ${fieldName})) 
      and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !='' ; `;
      res = await client.query(sqlCount);
      let count = res.rows[0].count;
      return { rows, success, count };
    } finally {
      client.release();
    }
  },
  // 更新错误的数据
  updateErrorRows: async function (ajid, tableName, field, newValue, rownums) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchCase(client, ajid);
      rownums = rownums.map((el) => {
        return `'${el}'`;
      });
      let sql = `update ${tableName} set ${field} = '${newValue}' where rownum in (${rownums})`;
      const res = await client.query(sql);
      return { success: true };
    } finally {
      client.release();
    }
  },
  // delete错误的数据
  deleteErrorRows: async function (ajid, tableName, rownums) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchCase(client, ajid);
      rownums = rownums.map((el) => {
        return `'${el}'`;
      });
      let sql = `delete from ${tableName} where rownum in (${rownums})`;
      const res = await client.query(sql);
      return { success: true };
    } finally {
      client.release();
    }
  },
  // 根据通用模版抽取数据到别的表中。
  extractSqlByGasbankrecords: async function (tempTableName, sjlyid) {
    let sql = "";
    // 抽取到人员信息表中
    sql += `INSERT INTO mz_person ( batch, ryid, ajid, sjlylx, sjlyid, zzhm, khmc, zzlx, zzlxmc, ckztlb, sjlx, sfdd ) SELECT
     CASE
         
       WHEN TRIM
         ( BOTH '  ' FROM batch ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM batch ) != '' THEN
           TRIM ( BOTH '  ' FROM batch ) ELSE'0' 
         END :: BIGINT batch,
       ryid,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM ajid ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM ajid ) != '' THEN
           TRIM ( BOTH '  ' FROM ajid ) ELSE'0' 
         END :: BIGINT ajid,
       '数据抽取' sjlylx,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM sjlyid ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM sjlyid ) != '' THEN
           TRIM ( BOTH '  ' FROM sjlyid ) ELSE'0' 
         END :: BIGINT sjlyid,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM jyzjhm ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM jyzjhm ) != '' THEN
           TRIM ( BOTH '  ' FROM jyzjhm ) ELSE'0' 
         END zzhm,
       TRIM ( BOTH '  ' FROM jymc ) khmc,
     CASE
         
         WHEN (
           LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
         ) 
         OR (
           ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
           AND (
             LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
             AND (
               POSITION ( '公司' IN jymc ) > 0 
               OR POSITION ( '集团' IN jymc ) > 0 
               OR POSITION ( '厂' IN jymc ) > 0 
               OR POSITION ( '中心' IN jymc ) > 0 
               OR POSITION ( '商行' IN jymc ) > 0 
               OR POSITION ( '企业' IN jymc ) > 0 
               OR POSITION ( '工作室' IN jymc ) > 0 
               OR POSITION ( '研究院' IN jymc ) > 0 
               OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
             ) 
           ) 
           ) THEN
           'dz1' ELSE'z1' 
         END zzlx,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
           AND (
             POSITION ( '公司' IN jymc ) > 0 
             OR POSITION ( '集团' IN jymc ) > 0 
             OR POSITION ( '厂' IN jymc ) > 0 
             OR POSITION ( '中心' IN jymc ) > 0 
             OR POSITION ( '商行' IN jymc ) > 0 
             OR POSITION ( '企业' IN jymc ) > 0 
             OR POSITION ( '工作室' IN jymc ) > 0 
             OR POSITION ( '研究院' IN jymc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
           ) 
         ) 
         ) THEN
         '企业法人营业执照' ELSE'居民身份证' 
       END zzlxmc,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
           AND (
             POSITION ( '公司' IN jymc ) > 0 
             OR POSITION ( '集团' IN jymc ) > 0 
             OR POSITION ( '厂' IN jymc ) > 0 
             OR POSITION ( '中心' IN jymc ) > 0 
             OR POSITION ( '商行' IN jymc ) > 0 
             OR POSITION ( '企业' IN jymc ) > 0 
             OR POSITION ( '工作室' IN jymc ) > 0 
             OR POSITION ( '研究院' IN jymc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
           ) 
         ) 
         ) THEN
         '02' ELSE'01' 
       END ckztlb,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
           AND (
             POSITION ( '公司' IN jymc ) > 0 
             OR POSITION ( '集团' IN jymc ) > 0 
             OR POSITION ( '厂' IN jymc ) > 0 
             OR POSITION ( '中心' IN jymc ) > 0 
             OR POSITION ( '商行' IN jymc ) > 0 
             OR POSITION ( '企业' IN jymc ) > 0 
             OR POSITION ( '工作室' IN jymc ) > 0 
             OR POSITION ( '研究院' IN jymc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
           ) 
         ) 
         ) THEN
         '98' ELSE'99' 
       END sjlx,
     CASE
       
       WHEN sfddbs = '1' THEN
       '0' ELSE'1' 
       END sfdd 
     FROM
       (
       SELECT
         *,
         ROW_NUMBER ( ) OVER ( PARTITION BY sjlyid, jyzjhm, jymc ) 
       FROM
         (
         SELECT
           batch,
           ryid,
           ajid,
           sjlyid,
           jyzjhm,
           jymc,
           sfddbs,
           sjlylx 
         FROM
           ${tempTableName} 
         WHERE
           SJLYID IN ( '${sjlyid}' ) 
           AND jyzjhm IS NOT NULL 
           AND jyzjhm != '' 
           AND jymc IS NOT NULL 
           AND jymc != '' 
         ) tt 
       WHERE
         tt.jyzjhm != '0' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1; `;

    sql += `INSERT INTO mz_person ( batch, ryid, ajid, sjlylx, sjlyid, zzhm, khmc, zzlx, zzlxmc, ckztlb, sjlx, sfdd ) SELECT
     CASE
         
       WHEN TRIM
         ( BOTH '  ' FROM batch ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM batch ) != '' THEN
           TRIM ( BOTH '  ' FROM batch ) ELSE'0' 
         END :: BIGINT batch,
       ryid,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM ajid ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM ajid ) != '' THEN
           TRIM ( BOTH '  ' FROM ajid ) ELSE'0' 
         END :: BIGINT ajid,
       '数据抽取' sjlylx,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM sjlyid ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM sjlyid ) != '' THEN
           TRIM ( BOTH '  ' FROM sjlyid ) ELSE'0' 
         END :: BIGINT sjlyid,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM jydfzjhm ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM jydfzjhm ) != '' THEN
           TRIM ( BOTH '  ' FROM jydfzjhm ) ELSE'0' 
         END zzhm,
       TRIM ( BOTH '  ' FROM jydfmc ) khmc,
     CASE
         
         WHEN (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
         ) 
         OR (
           ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
           AND (
             LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
             AND (
               POSITION ( '公司' IN jydfmc ) > 0 
               OR POSITION ( '集团' IN jydfmc ) > 0 
               OR POSITION ( '厂' IN jydfmc ) > 0 
               OR POSITION ( '中心' IN jydfmc ) > 0 
               OR POSITION ( '商行' IN jydfmc ) > 0 
               OR POSITION ( '企业' IN jydfmc ) > 0 
               OR POSITION ( '工作室' IN jydfmc ) > 0 
               OR POSITION ( '研究院' IN jydfmc ) > 0 
               OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
             ) 
           ) 
           ) THEN
           'dz1' ELSE'z1' 
         END zzlx,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
           AND (
             POSITION ( '公司' IN jydfmc ) > 0 
             OR POSITION ( '集团' IN jydfmc ) > 0 
             OR POSITION ( '厂' IN jydfmc ) > 0 
             OR POSITION ( '中心' IN jydfmc ) > 0 
             OR POSITION ( '商行' IN jydfmc ) > 0 
             OR POSITION ( '企业' IN jydfmc ) > 0 
             OR POSITION ( '工作室' IN jydfmc ) > 0 
             OR POSITION ( '研究院' IN jydfmc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
           ) 
         ) 
         ) THEN
         '企业法人营业执照' ELSE'居民身份证' 
       END zzlxmc,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
           AND (
             POSITION ( '公司' IN jydfmc ) > 0 
             OR POSITION ( '集团' IN jydfmc ) > 0 
             OR POSITION ( '厂' IN jydfmc ) > 0 
             OR POSITION ( '中心' IN jydfmc ) > 0 
             OR POSITION ( '商行' IN jydfmc ) > 0 
             OR POSITION ( '企业' IN jydfmc ) > 0 
             OR POSITION ( '工作室' IN jydfmc ) > 0 
             OR POSITION ( '研究院' IN jydfmc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
           ) 
         ) 
         ) THEN
         '02' ELSE'01' 
       END ckztlb,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
           AND (
             POSITION ( '公司' IN jydfmc ) > 0 
             OR POSITION ( '集团' IN jydfmc ) > 0 
             OR POSITION ( '厂' IN jydfmc ) > 0 
             OR POSITION ( '中心' IN jydfmc ) > 0 
             OR POSITION ( '商行' IN jydfmc ) > 0 
             OR POSITION ( '企业' IN jydfmc ) > 0 
             OR POSITION ( '工作室' IN jydfmc ) > 0 
             OR POSITION ( '研究院' IN jydfmc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
           ) 
         ) 
         ) THEN
         '98' ELSE'99' 
       END sjlx,
       '0' sfdd 
     FROM
       (
       SELECT
         *,
         ROW_NUMBER ( ) OVER ( PARTITION BY sjlyid, jydfzjhm, jydfmc ) 
       FROM
         (
         SELECT
           batch,
           ryid,
           ajid,
           sjlyid,
           jydfzjhm,
           jydfmc,
           sfddbs,
           sjlylx 
         FROM
           ${tempTableName} 
         WHERE
           SJLYID IN ( '${sjlyid}' ) 
           AND jydfzjhm IS NOT NULL 
           AND jydfzjhm != '' 
           AND jydfmc IS NOT NULL 
           AND jydfmc != '' 
      
         ) tt 
       WHERE
         tt.jydfzjhm != '0' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;

    sql += `INSERT INTO mz_account_info ( batch, ryid, ajid, sjlylx, sjlyid, zh, kh, zhkhmc, khrzjhm, zhkhyh ) SELECT
     batch,
     ryid,
     ajid,
     sjlylx,
     sjlyid,
     zh,
     kh,
     zhkhmc,
     khrzjhm,
     zhkhyh 
     FROM
       (
       SELECT TRIM
         ( BOTH '  ' FROM batch ) :: BIGINT batch,
         ryid,
         TRIM ( BOTH '  ' FROM ajid ) :: BIGINT ajid,
         '数据抽取' sjlylx,
         TRIM ( BOTH '  ' FROM sjlyid ) :: BIGINT sjlyid,
         TRIM ( BOTH '  ' FROM cxzh ) zh,
         TRIM ( BOTH '  ' FROM cxkh ) kh,
         TRIM ( BOTH '  ' FROM jymc ) zhkhmc,
         TRIM ( BOTH '  ' FROM jyzjhm ) khrzjhm,
         TRIM ( BOTH '  ' FROM jykhh ) zhkhyh,
         ROW_NUMBER ( ) OVER ( PARTITION BY ajid, sjlylx, sjlyid, cxzh, cxkh, jymc, jyzjhm ) 
       FROM
         ${tempTableName} 
       WHERE
         SJLYID IN ( '${sjlyid}' ) 
         AND cxzh IS NOT NULL 
         AND cxzh != '' 
         AND cxkh IS NOT NULL 
         AND cxkh != '' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;

    sql += `INSERT INTO mz_account_info ( batch, ryid, ajid, sjlylx, sjlyid, zh, kh, zhkhmc, khrzjhm, zhkhyh ) SELECT
     batch,
     ryid,
     ajid,
     sjlylx,
     sjlyid,
     zh,
     kh,
     zhkhmc,
     khrzjhm,
     zhkhyh 
     FROM
       (
       SELECT TRIM
         ( BOTH '  ' FROM batch ) :: BIGINT batch,
         ryid,
         TRIM ( BOTH '  ' FROM ajid ) :: BIGINT ajid,
         '数据抽取' sjlylx,
         TRIM ( BOTH '  ' FROM sjlyid ) :: BIGINT sjlyid,
         TRIM ( BOTH '  ' FROM jydfzkh ) zh,
         TRIM ( BOTH '  ' FROM jydfzkh ) kh,
         TRIM ( BOTH '  ' FROM jydfmc ) zhkhmc,
         TRIM ( BOTH '  ' FROM jydfzjhm ) khrzjhm,
         TRIM ( BOTH '  ' FROM jydfzhkhh ) zhkhyh,
         ROW_NUMBER ( ) OVER ( PARTITION BY ajid, sjlylx, sjlyid, jydfzkh, jydfmc, jydfzjhm ) 
       FROM
         ${tempTableName} 
       WHERE
         SJLYID IN ( '${sjlyid}' ) 
         AND jydfzkh IS NOT NULL 
         AND jydfzkh != '' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;
    return sql;
  },

  // 数据重置的抽取逻辑
  getDataResetExtractSqlByGasbankrecords: async function (
    tempTableName,
    ryid,
    sjlyids
  ) {
    let sql = "";
    // 抽取到人员信息表中
    sql += `INSERT INTO mz_person ( batch, ryid, ajid, sjlylx, sjlyid, zzhm, khmc, zzlx, zzlxmc, ckztlb, sjlx, sfdd ) SELECT
       batch,
       ryid,
       ajid,
       sjlylx,
       sjlyid,
     CASE
         WHEN TRIM ( BOTH '  ' FROM jyzjhm ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM jyzjhm ) != '' THEN
           TRIM ( BOTH '  ' FROM jyzjhm ) ELSE'0' 
         END zzhm,
       TRIM ( BOTH '  ' FROM jymc ) khmc,
     CASE
         
         WHEN (
           LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
         ) 
         OR (
           ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
           AND (
             LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
             AND (
               POSITION ( '公司' IN jymc ) > 0 
               OR POSITION ( '集团' IN jymc ) > 0 
               OR POSITION ( '厂' IN jymc ) > 0 
               OR POSITION ( '中心' IN jymc ) > 0 
               OR POSITION ( '商行' IN jymc ) > 0 
               OR POSITION ( '企业' IN jymc ) > 0 
               OR POSITION ( '工作室' IN jymc ) > 0 
               OR POSITION ( '研究院' IN jymc ) > 0 
               OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
               OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
             ) 
           ) 
           ) THEN
           'dz1' ELSE'z1' 
         END zzlx,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
           AND (
             POSITION ( '公司' IN jymc ) > 0 
             OR POSITION ( '集团' IN jymc ) > 0 
             OR POSITION ( '厂' IN jymc ) > 0 
             OR POSITION ( '中心' IN jymc ) > 0 
             OR POSITION ( '商行' IN jymc ) > 0 
             OR POSITION ( '企业' IN jymc ) > 0 
             OR POSITION ( '工作室' IN jymc ) > 0 
             OR POSITION ( '研究院' IN jymc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
           ) 
         ) 
         ) THEN
         '企业法人营业执照' ELSE'居民身份证' 
       END zzlxmc,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
           AND (
             POSITION ( '公司' IN jymc ) > 0 
             OR POSITION ( '集团' IN jymc ) > 0 
             OR POSITION ( '厂' IN jymc ) > 0 
             OR POSITION ( '中心' IN jymc ) > 0 
             OR POSITION ( '商行' IN jymc ) > 0 
             OR POSITION ( '企业' IN jymc ) > 0 
             OR POSITION ( '工作室' IN jymc ) > 0 
             OR POSITION ( '研究院' IN jymc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
           ) 
         ) 
         ) THEN
         '02' ELSE'01' 
       END ckztlb,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jyzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jymc ) ) > 6 
           AND (
             POSITION ( '公司' IN jymc ) > 0 
             OR POSITION ( '集团' IN jymc ) > 0 
             OR POSITION ( '厂' IN jymc ) > 0 
             OR POSITION ( '中心' IN jymc ) > 0 
             OR POSITION ( '商行' IN jymc ) > 0 
             OR POSITION ( '企业' IN jymc ) > 0 
             OR POSITION ( '工作室' IN jymc ) > 0 
             OR POSITION ( '研究院' IN jymc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jymc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jymc ) ) > 0 
           ) 
         ) 
         ) THEN
         '98' ELSE'99' 
       END sjlx,
     CASE
       
       WHEN sfddbs = '1' THEN
       '0' ELSE'1' 
       END sfdd 
     FROM
       (
       SELECT
         *,
         ROW_NUMBER ( ) OVER ( PARTITION BY sjlyid, jyzjhm, jymc ) 
       FROM
         (
         SELECT
           batch,
           '${ryid}' as ryid,
           ajid,
           sjlyid,
           jyzjhm,
           jymc,
           '' as sfddbs,
           sjlylx 
         FROM
           ${tempTableName} 
         WHERE
           SJLYID IN (${sjlyids}) 
           AND jyzjhm IS NOT NULL 
           AND jyzjhm != '' 
           AND jymc IS NOT NULL 
           AND jymc != '' 
         ) tt 
       WHERE
         tt.jyzjhm != '0' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1; `;

    sql += `\r\nINSERT INTO mz_person ( batch, ryid, ajid, sjlylx, sjlyid, zzhm, khmc, zzlx, zzlxmc, ckztlb, sjlx, sfdd ) SELECT
       batch,
       ryid,
       ajid,
       sjlylx,
       sjlyid,
     CASE
         
         WHEN TRIM ( BOTH '  ' FROM jydfzjhm ) IS NOT NULL 
         AND TRIM ( BOTH '  ' FROM jydfzjhm ) != '' THEN
           TRIM ( BOTH '  ' FROM jydfzjhm ) ELSE'0' 
         END zzhm,
       TRIM ( BOTH '  ' FROM jydfmc ) khmc,
     CASE
         
         WHEN (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
           AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
         ) 
         OR (
           ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
           AND (
             LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
             AND (
               POSITION ( '公司' IN jydfmc ) > 0 
               OR POSITION ( '集团' IN jydfmc ) > 0 
               OR POSITION ( '厂' IN jydfmc ) > 0 
               OR POSITION ( '中心' IN jydfmc ) > 0 
               OR POSITION ( '商行' IN jydfmc ) > 0 
               OR POSITION ( '企业' IN jydfmc ) > 0 
               OR POSITION ( '工作室' IN jydfmc ) > 0 
               OR POSITION ( '研究院' IN jydfmc ) > 0 
               OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
               OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
             ) 
           ) 
           ) THEN
           'dz1' ELSE'z1' 
         END zzlx,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
           AND (
             POSITION ( '公司' IN jydfmc ) > 0 
             OR POSITION ( '集团' IN jydfmc ) > 0 
             OR POSITION ( '厂' IN jydfmc ) > 0 
             OR POSITION ( '中心' IN jydfmc ) > 0 
             OR POSITION ( '商行' IN jydfmc ) > 0 
             OR POSITION ( '企业' IN jydfmc ) > 0 
             OR POSITION ( '工作室' IN jydfmc ) > 0 
             OR POSITION ( '研究院' IN jydfmc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
           ) 
         ) 
         ) THEN
         '企业法人营业执照' ELSE'居民身份证' 
       END zzlxmc,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
           AND (
             POSITION ( '公司' IN jydfmc ) > 0 
             OR POSITION ( '集团' IN jydfmc ) > 0 
             OR POSITION ( '厂' IN jydfmc ) > 0 
             OR POSITION ( '中心' IN jydfmc ) > 0 
             OR POSITION ( '商行' IN jydfmc ) > 0 
             OR POSITION ( '企业' IN jydfmc ) > 0 
             OR POSITION ( '工作室' IN jydfmc ) > 0 
             OR POSITION ( '研究院' IN jydfmc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
           ) 
         ) 
         ) THEN
         '02' ELSE'01' 
       END ckztlb,
     CASE
       
       WHEN (
         LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 15 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) != 18 
         AND LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 4 
       ) 
       OR (
         ( LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 18 OR LENGTH ( TRIM ( BOTH '  ' FROM jydfzjhm ) ) = 15 ) 
         AND (
           LENGTH ( TRIM ( BOTH '  ' FROM jydfmc ) ) > 6 
           AND (
             POSITION ( '公司' IN jydfmc ) > 0 
             OR POSITION ( '集团' IN jydfmc ) > 0 
             OR POSITION ( '厂' IN jydfmc ) > 0 
             OR POSITION ( '中心' IN jydfmc ) > 0 
             OR POSITION ( '商行' IN jydfmc ) > 0 
             OR POSITION ( '企业' IN jydfmc ) > 0 
             OR POSITION ( '工作室' IN jydfmc ) > 0 
             OR POSITION ( '研究院' IN jydfmc ) > 0 
             OR POSITION ( 'TRADING' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'TRADE' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'CO.' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LTD' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LLC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'INC' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'LIMIT' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'COMPANY' IN UPPER ( jydfmc ) ) > 0 
             OR POSITION ( 'IMP AND EXP' IN UPPER ( jydfmc ) ) > 0 
           ) 
         ) 
         ) THEN
         '98' ELSE'99' 
       END sjlx,
       '0' sfdd 
     FROM
       (
       SELECT
         *,
         ROW_NUMBER ( ) OVER ( PARTITION BY sjlyid, jydfzjhm, jydfmc ) 
       FROM
         (
         SELECT
           batch,
           '${ryid}' as ryid,
           ajid,
           sjlyid,
           jydfzjhm,
           jydfmc,
           '' as sfddbs,
           sjlylx 
         FROM
           ${tempTableName} 
         WHERE
         SJLYID IN (${sjlyids}) 
           AND jydfzjhm IS NOT NULL 
           AND jydfzjhm != '' 
           AND jydfmc IS NOT NULL 
           AND jydfmc != '' 
      
         ) tt 
       WHERE
         tt.jydfzjhm != '0' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;

    sql += `\r\nINSERT INTO mz_account_info ( batch, ryid, ajid, sjlylx, sjlyid, zh, kh, zhkhmc, khrzjhm, zhkhyh ) SELECT
     batch,
     '${ryid}' as ryid,
     ajid,
     sjlylx,
     sjlyid,
     zh,
     kh,
     zhkhmc,
     khrzjhm,
     zhkhyh 
     FROM
       (
       SELECT 
         batch,
         '${ryid}' as ryid,
         ajid,
         sjlylx,
         sjlyid,
         TRIM ( BOTH '  ' FROM cxzh ) zh,
         TRIM ( BOTH '  ' FROM cxkh ) kh,
         TRIM ( BOTH '  ' FROM jymc ) zhkhmc,
         TRIM ( BOTH '  ' FROM jyzjhm ) khrzjhm,
         TRIM ( BOTH '  ' FROM jykhh ) zhkhyh,
         ROW_NUMBER ( ) OVER ( PARTITION BY ajid, sjlylx, sjlyid, cxzh, cxkh, jymc, jyzjhm ) 
       FROM
         ${tempTableName} 
       WHERE
       SJLYID IN (${sjlyids}) 
         AND cxzh IS NOT NULL 
         AND cxzh != '' 
         AND cxkh IS NOT NULL 
         AND cxkh != '' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;

    sql += `\r\nINSERT INTO mz_account_info ( batch, ryid, ajid, sjlylx, sjlyid, zh, kh, zhkhmc, khrzjhm, zhkhyh ) SELECT
     batch,
     '${ryid}' as ryid,
     ajid,
     sjlylx,
     sjlyid,
     zh,
     kh,
     zhkhmc,
     khrzjhm,
     zhkhyh 
     FROM
       (
       SELECT 
         batch,
         '${ryid}' as ryid,
         ajid,
         sjlylx,
         sjlyid,
         TRIM ( BOTH '  ' FROM jydfzkh ) zh,
         TRIM ( BOTH '  ' FROM jydfzkh ) kh,
         TRIM ( BOTH '  ' FROM jydfmc ) zhkhmc,
         TRIM ( BOTH '  ' FROM jydfzjhm ) khrzjhm,
         TRIM ( BOTH '  ' FROM jydfzhkhh ) zhkhyh,
         ROW_NUMBER ( ) OVER ( PARTITION BY ajid, sjlylx, sjlyid, jydfzkh, jydfmc, jydfzjhm ) 
       FROM
         ${tempTableName} 
       WHERE
       SJLYID IN (${sjlyids}) 
         AND jydfzkh IS NOT NULL 
         AND jydfzkh != '' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;
    return sql;
  },

  // 根据反洗钱表中的temp数据抽取
  extractDataByFanxiqianTable: async function (tempTableName, sjlyid) {
    let sql = "";
    // 先抽取到account表
    sql += `INSERT into mz_account_info (batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh) 
    SELECT batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh  from ( SELECT TRIM(both '  ' FROM batch)::bigint batch,ryid, 
    TRIM(both '  ' FROM ajid)::bigint ajid,'数据抽取' sjlylx,TRIM(both '  ' FROM sjlyid)::bigint sjlyid, 
    TRIM(both '  ' FROM cxzh) zh,TRIM(both '  ' FROM cxkh) kh,TRIM(both '  ' FROM jymc) zhkhmc,TRIM(both '  ' FROM jyzjhm) khrzjhm, 
    TRIM(both '  ' FROM jykhh) zhkhyh, 
     row_number() OVER(PARTITION BY ajid,sjlylx,sjlyid,cxzh,cxkh,jymc,jyzjhm ) from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  AND 
    cxzh is not null and cxzh != '' and cxkh is not null and cxkh != '')  ss where   ss.ROW_NUMBER = 1 
    ;`;
    sql += `INSERT into mz_account_info (batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh) 
    SELECT batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh from ( SELECT TRIM(both '  ' FROM batch)::bigint batch,ryid, 
    TRIM(both '  ' FROM ajid)::bigint ajid,'数据抽取' sjlylx,TRIM(both '  ' FROM sjlyid)::bigint sjlyid, 
    TRIM(both '  ' FROM jydfzkh) zh,TRIM(both '  ' FROM jydfzkh) kh,TRIM(both '  ' FROM jydfmc) zhkhmc,TRIM(both '  ' FROM jydfzjhm) khrzjhm, 
    TRIM(both '  ' FROM jydfzhkhh) zhkhyh, 
     row_number() OVER(PARTITION BY ajid,sjlylx,sjlyid,jydfzkh,jydfmc,jydfzjhm ) from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  AND 
    jydfzkh is not null and jydfzkh != '' )  ss where   ss.ROW_NUMBER = 1; 
    `;
    //抽取数据到person表
    sql += `INSERT into mz_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
    select case when TRIM(both '  ' FROM batch) is not null and TRIM(both '  ' FROM batch) !='' then TRIM(both '  ' FROM batch) else '0' end::bigint batch, 
    ryid, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    case when TRIM(both '  ' FROM jydfzjhm) is not null and TRIM(both '  ' FROM jydfzjhm) !='' then TRIM(both '  ' FROM jydfzjhm) else '0' end zzhm, 
     TRIM(both '  ' FROM jydfmc) khmc , CASE WHEN (LENGTH(TRIM(both '  ' FROM jydfzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jydfzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jydfmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jydfzjhm))=18 or LENGTH(TRIM(both '  ' FROM jydfzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jydfmc))>6 and  (position('公司' in jydfmc)>0 or  position('集团' in jydfmc)>0 or  position('厂' in jydfmc)>0 or  position('中心' in jydfmc)>0 or  position('商行' in jydfmc)>0  or  position('企业' in jydfmc)>0  or  position('工作室' in jydfmc)>0  or  position('研究院' in jydfmc)>0    
                     or  position('TRADING' in  upper(jydfmc))>0  or  position('TRADE' in  upper(jydfmc))>0  or  position('CO.' in  upper(jydfmc))>0  or  position('LTD' in  upper(jydfmc))>0  or  position('LLC' in  upper(jydfmc))>0  or  position('INC' in  upper(jydfmc))>0  or  position('LIMIT' in  upper(jydfmc))>0  or  position('COMPANY' in  upper(jydfmc))>0  or  position('IMP AND EXP' in  upper(jydfmc))>0  )))     
                       THEN  'dz1'  ELSE 'z1' END zzlx, 
     
                      CASE WHEN (LENGTH(TRIM(both '  ' FROM jydfzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jydfzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jydfmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jydfzjhm))=18 or LENGTH(TRIM(both '  ' FROM jydfzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jydfmc))>6 and  (position('公司' in jydfmc)>0 or  position('集团' in jydfmc)>0 or  position('厂' in jydfmc)>0 or  position('中心' in jydfmc)>0 or  position('商行' in jydfmc)>0  or  position('企业' in jydfmc)>0  or  position('工作室' in jydfmc)>0  or  position('研究院' in jydfmc)>0   
                    or  position('TRADING' in  upper(jydfmc))>0  or  position('TRADE' in  upper(jydfmc))>0  or  position('CO.' in  upper(jydfmc))>0  or  position('LTD' in  upper(jydfmc))>0  or  position('LLC' in  upper(jydfmc))>0  or  position('INC' in  upper(jydfmc))>0  or  position('LIMIT' in  upper(jydfmc))>0  or  position('COMPANY' in  upper(jydfmc))>0  or  position('IMP AND EXP' in  upper(jydfmc))>0  )))     
                     THEN '企业法人营业执照'  ELSE '居民身份证' END zzlxmc , 
     
                   CASE WHEN (LENGTH(TRIM(both '  ' FROM jydfzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jydfzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jydfmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jydfzjhm))=18 or LENGTH(TRIM(both '  ' FROM jydfzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jydfmc))>6 and  (position('公司' in jydfmc)>0 or  position('集团' in jydfmc)>0 or  position('厂' in jydfmc)>0 or  position('中心' in jydfmc)>0 or  position('商行' in jydfmc)>0  or  position('企业' in jydfmc)>0  or  position('工作室' in jydfmc)>0  or  position('研究院' in jydfmc)>0   
                    or  position('TRADING' in  upper(jydfmc))>0  or  position('TRADE' in  upper(jydfmc))>0  or  position('CO.' in  upper(jydfmc))>0  or  position('LTD' in  upper(jydfmc))>0  or  position('LLC' in  upper(jydfmc))>0  or  position('INC' in  upper(jydfmc))>0  or  position('LIMIT' in  upper(jydfmc))>0  or  position('COMPANY' in  upper(jydfmc))>0  or  position('IMP AND EXP' in  upper(jydfmc))>0  )))     
                     THEN '02'  ELSE '01' END ckztlb , 
     
                     CASE WHEN (LENGTH(TRIM(both '  ' FROM jydfzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jydfzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jydfmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jydfzjhm))=18 or LENGTH(TRIM(both '  ' FROM jydfzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jydfmc))>6 and  (position('公司' in jydfmc)>0 or  position('集团' in jydfmc)>0 or  position('厂' in jydfmc)>0 or  position('中心' in jydfmc)>0 or  position('商行' in jydfmc)>0  or  position('企业' in jydfmc)>0  or  position('工作室' in jydfmc)>0  or  position('研究院' in jydfmc)>0  
                    or  position('TRADING' in  upper(jydfmc))>0  or  position('TRADE' in  upper(jydfmc))>0  or  position('CO.' in  upper(jydfmc))>0  or  position('LTD' in  upper(jydfmc))>0  or  position('LLC' in  upper(jydfmc))>0  or  position('INC' in  upper(jydfmc))>0  or  position('LIMIT' in  upper(jydfmc))>0  or  position('COMPANY' in  upper(jydfmc))>0  or  position('IMP AND EXP' in  upper(jydfmc))>0  )))     
                     THEN   '98'  ELSE '99' END sjlx , 
    '0' sfdd  from ( select *, row_number() OVER(PARTITION BY sjlyid,jydfzjhm,jydfmc) from  (SELECT batch,ryid,ajid,sjlyid,jydfzjhm,jydfmc,sfddbs,sjlylx 
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}') and jydfzjhm is not null and jydfzjhm != '' and jydfmc is not null and jydfmc != '') tt  where tt.jydfzjhm!='0' ) ss where ss.ROW_NUMBER = 1 
    ;`;
    sql += `INSERT into mz_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
    select case when TRIM(both '  ' FROM batch) is not null and TRIM(both '  ' FROM batch) !='' then TRIM(both '  ' FROM batch) else '0' end::bigint batch, 
    ryid, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    case when TRIM(both '  ' FROM jyzjhm) is not null and TRIM(both '  ' FROM jyzjhm) !='' then TRIM(both '  ' FROM jyzjhm) else '0' end zzhm, 
     TRIM(both '  ' FROM jymc) khmc , CASE WHEN (LENGTH(TRIM(both '  ' FROM jyzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jyzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jymc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jyzjhm))=18 or LENGTH(TRIM(both '  ' FROM jyzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jymc))>6 and  (position('公司' in jymc)>0 or  position('集团' in jymc)>0 or  position('厂' in jymc)>0 or  position('中心' in jymc)>0 or  position('商行' in jymc)>0  or  position('企业' in jymc)>0  or  position('工作室' in jymc)>0  or  position('研究院' in jymc)>0    
                     or  position('TRADING' in  upper(jymc))>0  or  position('TRADE' in  upper(jymc))>0  or  position('CO.' in  upper(jymc))>0  or  position('LTD' in  upper(jymc))>0  or  position('LLC' in  upper(jymc))>0  or  position('INC' in  upper(jymc))>0  or  position('LIMIT' in  upper(jymc))>0  or  position('COMPANY' in  upper(jymc))>0  or  position('IMP AND EXP' in  upper(jymc))>0  )))     
                       THEN  'dz1'  ELSE 'z1' END zzlx, 
     
                      CASE WHEN (LENGTH(TRIM(both '  ' FROM jyzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jyzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jymc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jyzjhm))=18 or LENGTH(TRIM(both '  ' FROM jyzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jymc))>6 and  (position('公司' in jymc)>0 or  position('集团' in jymc)>0 or  position('厂' in jymc)>0 or  position('中心' in jymc)>0 or  position('商行' in jymc)>0  or  position('企业' in jymc)>0  or  position('工作室' in jymc)>0  or  position('研究院' in jymc)>0   
                    or  position('TRADING' in  upper(jymc))>0  or  position('TRADE' in  upper(jymc))>0  or  position('CO.' in  upper(jymc))>0  or  position('LTD' in  upper(jymc))>0  or  position('LLC' in  upper(jymc))>0  or  position('INC' in  upper(jymc))>0  or  position('LIMIT' in  upper(jymc))>0  or  position('COMPANY' in  upper(jymc))>0  or  position('IMP AND EXP' in  upper(jymc))>0  )))     
                     THEN '企业法人营业执照'  ELSE '居民身份证' END zzlxmc , 
     
                   CASE WHEN (LENGTH(TRIM(both '  ' FROM jyzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jyzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jymc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jyzjhm))=18 or LENGTH(TRIM(both '  ' FROM jyzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jymc))>6 and  (position('公司' in jymc)>0 or  position('集团' in jymc)>0 or  position('厂' in jymc)>0 or  position('中心' in jymc)>0 or  position('商行' in jymc)>0  or  position('企业' in jymc)>0  or  position('工作室' in jymc)>0  or  position('研究院' in jymc)>0   
                    or  position('TRADING' in  upper(jymc))>0  or  position('TRADE' in  upper(jymc))>0  or  position('CO.' in  upper(jymc))>0  or  position('LTD' in  upper(jymc))>0  or  position('LLC' in  upper(jymc))>0  or  position('INC' in  upper(jymc))>0  or  position('LIMIT' in  upper(jymc))>0  or  position('COMPANY' in  upper(jymc))>0  or  position('IMP AND EXP' in  upper(jymc))>0  )))     
                     THEN '02'  ELSE '01' END ckztlb , 
     
                     CASE WHEN (LENGTH(TRIM(both '  ' FROM jyzjhm))!=15 and LENGTH(TRIM(both '  ' FROM jyzjhm))!=18  and  LENGTH(TRIM(both '  ' FROM jymc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM jyzjhm))=18 or LENGTH(TRIM(both '  ' FROM jyzjhm))=15) AND (LENGTH(TRIM(both '  ' FROM jymc))>6 and  (position('公司' in jymc)>0 or  position('集团' in jymc)>0 or  position('厂' in jymc)>0 or  position('中心' in jymc)>0 or  position('商行' in jymc)>0  or  position('企业' in jymc)>0  or  position('工作室' in jymc)>0  or  position('研究院' in jymc)>0  
                    or  position('TRADING' in  upper(jymc))>0  or  position('TRADE' in  upper(jymc))>0  or  position('CO.' in  upper(jymc))>0  or  position('LTD' in  upper(jymc))>0  or  position('LLC' in  upper(jymc))>0  or  position('INC' in  upper(jymc))>0  or  position('LIMIT' in  upper(jymc))>0  or  position('COMPANY' in  upper(jymc))>0  or  position('IMP AND EXP' in  upper(jymc))>0  )))     
                     THEN   '98'  ELSE '99' END sjlx , 
     case when sfddbs='1' then '0' else '1' end  sfdd  from ( select *, row_number() OVER(PARTITION BY sjlyid,jyzjhm,jymc) from  (SELECT batch,ryid,ajid,sjlyid,jyzjhm,jymc,sfddbs,sjlylx 
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}') and jyzjhm is not null and jyzjhm != '' and jymc is not null and jymc != '' ) tt  where tt.jyzjhm!='0' ) ss where ss.ROW_NUMBER = 1 
    ;`;
    return sql;
  },
  extractDataBymz_tax_swdj: async function (tempTableName, sjlyid) {
    let sql = "";
    //mz_person
    sql += `insert into mz_person(batch,ajid,sjlylx,sjlyid,zzhm,khmc,zcdz,jyd,frdbxm,frdbzjhm,zczb,jyfw,yyksqx,yyjsqx,frdbzjlx,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
    select case when batch is not null and TRIM(both '  ' FROM batch) !='' then batch else '0' end::bigint batch, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    nssbh zzhm,nsrmc khmc,gsdjdz zcdz,scjydz jyd,fddbrmc frdbxm,fddbrsfzh frdbzjhm,zczb zczb,jyfw jyfw,'' yyksqx,'' yyjsqx,'' frdbzjlx,ryid , CASE WHEN (LENGTH(TRIM(both '  ' FROM nssbh))!=15 and LENGTH(TRIM(both '  ' FROM nssbh))!=18  and  LENGTH(TRIM(both '  ' FROM nsrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM nssbh))=18 or LENGTH(TRIM(both '  ' FROM nssbh))=15) AND (LENGTH(TRIM(both '  ' FROM nsrmc))>6 and  (position('公司' in nsrmc)>0 or  position('集团' in nsrmc)>0 or  position('厂' in nsrmc)>0 or  position('中心' in nsrmc)>0 or  position('商行' in nsrmc)>0  or  position('企业' in nsrmc)>0  or  position('工作室' in nsrmc)>0  or  position('研究院' in nsrmc)>0    
                     or  position('TRADING' in  upper(nsrmc))>0  or  position('TRADE' in  upper(nsrmc))>0  or  position('CO.' in  upper(nsrmc))>0  or  position('LTD' in  upper(nsrmc))>0  or  position('LLC' in  upper(nsrmc))>0  or  position('INC' in  upper(nsrmc))>0  or  position('LIMIT' in  upper(nsrmc))>0  or  position('COMPANY' in  upper(nsrmc))>0  or  position('IMP AND EXP' in  upper(nsrmc))>0  )))     
                       THEN  'dz1'  ELSE 'z1' END zzlx, 
     
                      CASE WHEN (LENGTH(TRIM(both '  ' FROM nssbh))!=15 and LENGTH(TRIM(both '  ' FROM nssbh))!=18  and  LENGTH(TRIM(both '  ' FROM nsrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM nssbh))=18 or LENGTH(TRIM(both '  ' FROM nssbh))=15) AND (LENGTH(TRIM(both '  ' FROM nsrmc))>6 and  (position('公司' in nsrmc)>0 or  position('集团' in nsrmc)>0 or  position('厂' in nsrmc)>0 or  position('中心' in nsrmc)>0 or  position('商行' in nsrmc)>0  or  position('企业' in nsrmc)>0  or  position('工作室' in nsrmc)>0  or  position('研究院' in nsrmc)>0   
                    or  position('TRADING' in  upper(nsrmc))>0  or  position('TRADE' in  upper(nsrmc))>0  or  position('CO.' in  upper(nsrmc))>0  or  position('LTD' in  upper(nsrmc))>0  or  position('LLC' in  upper(nsrmc))>0  or  position('INC' in  upper(nsrmc))>0  or  position('LIMIT' in  upper(nsrmc))>0  or  position('COMPANY' in  upper(nsrmc))>0  or  position('IMP AND EXP' in  upper(nsrmc))>0  )))     
                     THEN '企业法人营业执照'  ELSE '居民身份证' END zzlxmc , 
     
                   CASE WHEN (LENGTH(TRIM(both '  ' FROM nssbh))!=15 and LENGTH(TRIM(both '  ' FROM nssbh))!=18  and  LENGTH(TRIM(both '  ' FROM nsrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM nssbh))=18 or LENGTH(TRIM(both '  ' FROM nssbh))=15) AND (LENGTH(TRIM(both '  ' FROM nsrmc))>6 and  (position('公司' in nsrmc)>0 or  position('集团' in nsrmc)>0 or  position('厂' in nsrmc)>0 or  position('中心' in nsrmc)>0 or  position('商行' in nsrmc)>0  or  position('企业' in nsrmc)>0  or  position('工作室' in nsrmc)>0  or  position('研究院' in nsrmc)>0   
                    or  position('TRADING' in  upper(nsrmc))>0  or  position('TRADE' in  upper(nsrmc))>0  or  position('CO.' in  upper(nsrmc))>0  or  position('LTD' in  upper(nsrmc))>0  or  position('LLC' in  upper(nsrmc))>0  or  position('INC' in  upper(nsrmc))>0  or  position('LIMIT' in  upper(nsrmc))>0  or  position('COMPANY' in  upper(nsrmc))>0  or  position('IMP AND EXP' in  upper(nsrmc))>0  )))     
                     THEN '02'  ELSE '01' END ckztlb , 
     
                     CASE WHEN (LENGTH(TRIM(both '  ' FROM nssbh))!=15 and LENGTH(TRIM(both '  ' FROM nssbh))!=18  and  LENGTH(TRIM(both '  ' FROM nsrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM nssbh))=18 or LENGTH(TRIM(both '  ' FROM nssbh))=15) AND (LENGTH(TRIM(both '  ' FROM nsrmc))>6 and  (position('公司' in nsrmc)>0 or  position('集团' in nsrmc)>0 or  position('厂' in nsrmc)>0 or  position('中心' in nsrmc)>0 or  position('商行' in nsrmc)>0  or  position('企业' in nsrmc)>0  or  position('工作室' in nsrmc)>0  or  position('研究院' in nsrmc)>0  
                    or  position('TRADING' in  upper(nsrmc))>0  or  position('TRADE' in  upper(nsrmc))>0  or  position('CO.' in  upper(nsrmc))>0  or  position('LTD' in  upper(nsrmc))>0  or  position('LLC' in  upper(nsrmc))>0  or  position('INC' in  upper(nsrmc))>0  or  position('LIMIT' in  upper(nsrmc))>0  or  position('COMPANY' in  upper(nsrmc))>0  or  position('IMP AND EXP' in  upper(nsrmc))>0  )))     
                     THEN   '98'  ELSE '99' END sjlx 
    ,'1' sfdd from ${tempTableName}  
    where SJLYID IN('${sjlyid}') and nssbh is not null and nssbh!='';`;

    sql += `insert into mz_person(batch,ajid,sjlylx,sjlyid,khmc,zzhm,lxsj,lxdh,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
    select case when batch is not null and TRIM(both '  ' FROM batch) !='' then batch else '0' end::bigint batch, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    fddbrmc khmc,fddbrsfzh zzhm,frlxfs lxsj,'' lxdh,'' ryid , CASE WHEN (LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM fddbrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM fddbrsfzh))=18 or LENGTH(TRIM(both '  ' FROM fddbrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM fddbrmc))>6 and  (position('公司' in fddbrmc)>0 or  position('集团' in fddbrmc)>0 or  position('厂' in fddbrmc)>0 or  position('中心' in fddbrmc)>0 or  position('商行' in fddbrmc)>0  or  position('企业' in fddbrmc)>0  or  position('工作室' in fddbrmc)>0  or  position('研究院' in fddbrmc)>0    
                     or  position('TRADING' in  upper(fddbrmc))>0  or  position('TRADE' in  upper(fddbrmc))>0  or  position('CO.' in  upper(fddbrmc))>0  or  position('LTD' in  upper(fddbrmc))>0  or  position('LLC' in  upper(fddbrmc))>0  or  position('INC' in  upper(fddbrmc))>0  or  position('LIMIT' in  upper(fddbrmc))>0  or  position('COMPANY' in  upper(fddbrmc))>0  or  position('IMP AND EXP' in  upper(fddbrmc))>0  )))     
                       THEN  'dz1'  ELSE 'z1' END zzlx, 
     
                      CASE WHEN (LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM fddbrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM fddbrsfzh))=18 or LENGTH(TRIM(both '  ' FROM fddbrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM fddbrmc))>6 and  (position('公司' in fddbrmc)>0 or  position('集团' in fddbrmc)>0 or  position('厂' in fddbrmc)>0 or  position('中心' in fddbrmc)>0 or  position('商行' in fddbrmc)>0  or  position('企业' in fddbrmc)>0  or  position('工作室' in fddbrmc)>0  or  position('研究院' in fddbrmc)>0   
                    or  position('TRADING' in  upper(fddbrmc))>0  or  position('TRADE' in  upper(fddbrmc))>0  or  position('CO.' in  upper(fddbrmc))>0  or  position('LTD' in  upper(fddbrmc))>0  or  position('LLC' in  upper(fddbrmc))>0  or  position('INC' in  upper(fddbrmc))>0  or  position('LIMIT' in  upper(fddbrmc))>0  or  position('COMPANY' in  upper(fddbrmc))>0  or  position('IMP AND EXP' in  upper(fddbrmc))>0  )))     
                     THEN '企业法人营业执照'  ELSE '居民身份证' END zzlxmc , 
     
                   CASE WHEN (LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM fddbrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM fddbrsfzh))=18 or LENGTH(TRIM(both '  ' FROM fddbrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM fddbrmc))>6 and  (position('公司' in fddbrmc)>0 or  position('集团' in fddbrmc)>0 or  position('厂' in fddbrmc)>0 or  position('中心' in fddbrmc)>0 or  position('商行' in fddbrmc)>0  or  position('企业' in fddbrmc)>0  or  position('工作室' in fddbrmc)>0  or  position('研究院' in fddbrmc)>0   
                    or  position('TRADING' in  upper(fddbrmc))>0  or  position('TRADE' in  upper(fddbrmc))>0  or  position('CO.' in  upper(fddbrmc))>0  or  position('LTD' in  upper(fddbrmc))>0  or  position('LLC' in  upper(fddbrmc))>0  or  position('INC' in  upper(fddbrmc))>0  or  position('LIMIT' in  upper(fddbrmc))>0  or  position('COMPANY' in  upper(fddbrmc))>0  or  position('IMP AND EXP' in  upper(fddbrmc))>0  )))     
                     THEN '02'  ELSE '01' END ckztlb , 
     
                     CASE WHEN (LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM fddbrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM fddbrmc))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM fddbrsfzh))=18 or LENGTH(TRIM(both '  ' FROM fddbrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM fddbrmc))>6 and  (position('公司' in fddbrmc)>0 or  position('集团' in fddbrmc)>0 or  position('厂' in fddbrmc)>0 or  position('中心' in fddbrmc)>0 or  position('商行' in fddbrmc)>0  or  position('企业' in fddbrmc)>0  or  position('工作室' in fddbrmc)>0  or  position('研究院' in fddbrmc)>0  
                    or  position('TRADING' in  upper(fddbrmc))>0  or  position('TRADE' in  upper(fddbrmc))>0  or  position('CO.' in  upper(fddbrmc))>0  or  position('LTD' in  upper(fddbrmc))>0  or  position('LLC' in  upper(fddbrmc))>0  or  position('INC' in  upper(fddbrmc))>0  or  position('LIMIT' in  upper(fddbrmc))>0  or  position('COMPANY' in  upper(fddbrmc))>0  or  position('IMP AND EXP' in  upper(fddbrmc))>0  )))     
                     THEN   '98'  ELSE '99' END sjlx 
    ,'1' sfdd from ${tempTableName}  
    where SJLYID IN('${sjlyid}') and fddbrsfzh is not null and fddbrsfzh!='';`;

    sql += `insert into mz_person(batch,ajid,sjlylx,sjlyid,khmc,zzhm,lxsj,lxdh,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
    select case when batch is not null and TRIM(both '  ' FROM batch) !='' then batch else '0' end::bigint batch, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    cwxm khmc,cwsfzh zzhm,'' lxsj,cwfzrgddh lxdh,'' ryid , CASE WHEN (LENGTH(TRIM(both '  ' FROM cwsfzh))!=15 and LENGTH(TRIM(both '  ' FROM cwsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM cwxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM cwsfzh))=18 or LENGTH(TRIM(both '  ' FROM cwsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM cwxm))>6 and  (position('公司' in cwxm)>0 or  position('集团' in cwxm)>0 or  position('厂' in cwxm)>0 or  position('中心' in cwxm)>0 or  position('商行' in cwxm)>0  or  position('企业' in cwxm)>0  or  position('工作室' in cwxm)>0  or  position('研究院' in cwxm)>0    
                     or  position('TRADING' in  upper(cwxm))>0  or  position('TRADE' in  upper(cwxm))>0  or  position('CO.' in  upper(cwxm))>0  or  position('LTD' in  upper(cwxm))>0  or  position('LLC' in  upper(cwxm))>0  or  position('INC' in  upper(cwxm))>0  or  position('LIMIT' in  upper(cwxm))>0  or  position('COMPANY' in  upper(cwxm))>0  or  position('IMP AND EXP' in  upper(cwxm))>0  )))     
                       THEN  'dz1'  ELSE 'z1' END zzlx, 
     
                      CASE WHEN (LENGTH(TRIM(both '  ' FROM cwsfzh))!=15 and LENGTH(TRIM(both '  ' FROM cwsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM cwxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM cwsfzh))=18 or LENGTH(TRIM(both '  ' FROM cwsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM cwxm))>6 and  (position('公司' in cwxm)>0 or  position('集团' in cwxm)>0 or  position('厂' in cwxm)>0 or  position('中心' in cwxm)>0 or  position('商行' in cwxm)>0  or  position('企业' in cwxm)>0  or  position('工作室' in cwxm)>0  or  position('研究院' in cwxm)>0   
                    or  position('TRADING' in  upper(cwxm))>0  or  position('TRADE' in  upper(cwxm))>0  or  position('CO.' in  upper(cwxm))>0  or  position('LTD' in  upper(cwxm))>0  or  position('LLC' in  upper(cwxm))>0  or  position('INC' in  upper(cwxm))>0  or  position('LIMIT' in  upper(cwxm))>0  or  position('COMPANY' in  upper(cwxm))>0  or  position('IMP AND EXP' in  upper(cwxm))>0  )))     
                     THEN '企业法人营业执照'  ELSE '居民身份证' END zzlxmc , 
     
                   CASE WHEN (LENGTH(TRIM(both '  ' FROM cwsfzh))!=15 and LENGTH(TRIM(both '  ' FROM cwsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM cwxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM cwsfzh))=18 or LENGTH(TRIM(both '  ' FROM cwsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM cwxm))>6 and  (position('公司' in cwxm)>0 or  position('集团' in cwxm)>0 or  position('厂' in cwxm)>0 or  position('中心' in cwxm)>0 or  position('商行' in cwxm)>0  or  position('企业' in cwxm)>0  or  position('工作室' in cwxm)>0  or  position('研究院' in cwxm)>0   
                    or  position('TRADING' in  upper(cwxm))>0  or  position('TRADE' in  upper(cwxm))>0  or  position('CO.' in  upper(cwxm))>0  or  position('LTD' in  upper(cwxm))>0  or  position('LLC' in  upper(cwxm))>0  or  position('INC' in  upper(cwxm))>0  or  position('LIMIT' in  upper(cwxm))>0  or  position('COMPANY' in  upper(cwxm))>0  or  position('IMP AND EXP' in  upper(cwxm))>0  )))     
                     THEN '02'  ELSE '01' END ckztlb , 
     
                     CASE WHEN (LENGTH(TRIM(both '  ' FROM cwsfzh))!=15 and LENGTH(TRIM(both '  ' FROM cwsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM cwxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM cwsfzh))=18 or LENGTH(TRIM(both '  ' FROM cwsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM cwxm))>6 and  (position('公司' in cwxm)>0 or  position('集团' in cwxm)>0 or  position('厂' in cwxm)>0 or  position('中心' in cwxm)>0 or  position('商行' in cwxm)>0  or  position('企业' in cwxm)>0  or  position('工作室' in cwxm)>0  or  position('研究院' in cwxm)>0  
                  
      or  position('TRADING' in  upper(cwxm))>0  or  position('TRADE' in  upper(cwxm))>0  or  position('CO.' in  upper(cwxm))>0  or  position('LTD' in  upper(cwxm))>0  or  position('LLC' in  upper(cwxm))>0  or  position('INC' in  upper(cwxm))>0  or  position('LIMIT' in  upper(cwxm))>0  or  position('COMPANY' in  upper(cwxm))>0  or  position('IMP AND EXP' in  upper(cwxm))>0  )))     
                     THEN   '98'  ELSE '99' END sjlx 
    ,'1' sfdd from ${tempTableName}  
    where SJLYID IN('${sjlyid}')  and cwsfzh is not null and cwsfzh!='';`;

    sql += `insert into mz_person(batch,ajid,sjlylx,sjlyid,khmc,zzhm,lxsj,lxdh,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
    select case when batch is not null and TRIM(both '  ' FROM batch) !='' then batch else '0' end::bigint batch, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    bsrxm khmc,bsrsfzh zzhm,bsrlxfs lxsj,cwfzrgddh lxdh,'' ryid , CASE WHEN (LENGTH(TRIM(both '  ' FROM bsrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM bsrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM bsrxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM bsrsfzh))=18 or LENGTH(TRIM(both '  ' FROM bsrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM bsrxm))>6 and  (position('公司' in bsrxm)>0 or  position('集团' in bsrxm)>0 or  position('厂' in bsrxm)>0 or  position('中心' in bsrxm)>0 or  position('商行' in bsrxm)>0  or  position('企业' in bsrxm)>0  or  position('工作室' in bsrxm)>0  or  position('研究院' in bsrxm)>0    
                     or  position('TRADING' in  upper(bsrxm))>0  or  position('TRADE' in  upper(bsrxm))>0  or  position('CO.' in  upper(bsrxm))>0  or  position('LTD' in  upper(bsrxm))>0  or  position('LLC' in  upper(bsrxm))>0  or  position('INC' in  upper(bsrxm))>0  or  position('LIMIT' in  upper(bsrxm))>0  or  position('COMPANY' in  upper(bsrxm))>0  or  position('IMP AND EXP' in  upper(bsrxm))>0  )))     
                       THEN  'dz1'  ELSE 'z1' END zzlx, 
     
                      CASE WHEN (LENGTH(TRIM(both '  ' FROM bsrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM bsrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM bsrxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM bsrsfzh))=18 or LENGTH(TRIM(both '  ' FROM bsrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM bsrxm))>6 and  (position('公司' in bsrxm)>0 or  position('集团' in bsrxm)>0 or  position('厂' in bsrxm)>0 or  position('中心' in bsrxm)>0 or  position('商行' in bsrxm)>0  or  position('企业' in bsrxm)>0  or  position('工作室' in bsrxm)>0  or  position('研究院' in bsrxm)>0   
                    or  position('TRADING' in  upper(bsrxm))>0  or  position('TRADE' in  upper(bsrxm))>0  or  position('CO.' in  upper(bsrxm))>0  or  position('LTD' in  upper(bsrxm))>0  or  position('LLC' in  upper(bsrxm))>0  or  position('INC' in  upper(bsrxm))>0  or  position('LIMIT' in  upper(bsrxm))>0  or  position('COMPANY' in  upper(bsrxm))>0  or  position('IMP AND EXP' in  upper(bsrxm))>0  )))     
                     THEN '企业法人营业执照'  ELSE '居民身份证' END zzlxmc , 
     
                   CASE WHEN (LENGTH(TRIM(both '  ' FROM bsrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM bsrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM bsrxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM bsrsfzh))=18 or LENGTH(TRIM(both '  ' FROM bsrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM bsrxm))>6 and  (position('公司' in bsrxm)>0 or  position('集团' in bsrxm)>0 or  position('厂' in bsrxm)>0 or  position('中心' in bsrxm)>0 or  position('商行' in bsrxm)>0  or  position('企业' in bsrxm)>0  or  position('工作室' in bsrxm)>0  or  position('研究院' in bsrxm)>0   
                    or  position('TRADING' in  upper(bsrxm))>0  or  position('TRADE' in  upper(bsrxm))>0  or  position('CO.' in  upper(bsrxm))>0  or  position('LTD' in  upper(bsrxm))>0  or  position('LLC' in  upper(bsrxm))>0  or  position('INC' in  upper(bsrxm))>0  or  position('LIMIT' in  upper(bsrxm))>0  or  position('COMPANY' in  upper(bsrxm))>0  or  position('IMP AND EXP' in  upper(bsrxm))>0  )))     
                     THEN '02'  ELSE '01' END ckztlb , 
     
                     CASE WHEN (LENGTH(TRIM(both '  ' FROM bsrsfzh))!=15 and LENGTH(TRIM(both '  ' FROM bsrsfzh))!=18  and  LENGTH(TRIM(both '  ' FROM bsrxm))>4 ) or  
                     ((LENGTH(TRIM(both '  ' FROM bsrsfzh))=18 or LENGTH(TRIM(both '  ' FROM bsrsfzh))=15) AND (LENGTH(TRIM(both '  ' FROM bsrxm))>6 and  (position('公司' in bsrxm)>0 or  position('集团' in bsrxm)>0 or  position('厂' in bsrxm)>0 or  position('中心' in bsrxm)>0 or  position('商行' in bsrxm)>0  or  position('企业' in bsrxm
    )>0  or  position('工作室' in bsrxm)>0  or  position('研究院' in bsrxm)>0  
                    or  position('TRADING' in  upper(bsrxm))>0  or  position('TRADE' in  upper(bsrxm))>0  or  position('CO.' in  upper(bsrxm))>0  or  position('LTD' in  upper(bsrxm))>0  or  position('LLC' in  upper(bsrxm))>0  or  position('INC' in  upper(bsrxm))>0  or  position('LIMIT' in  upper(bsrxm))>0  or  position('COMPANY' in  upper(bsrxm))>0  or  position('IMP AND EXP' in  upper(bsrxm))>0  )))     
                     THEN   '98'  ELSE '99' END sjlx 
    ,'1' sfdd from ${tempTableName}   
    where SJLYID IN('${sjlyid}') and bsrsfzh is not null and bsrsfzh!='';`;
    return sql;
  },
  extractDataBymz_tax_records: async function (tempTableName, sjlyid) {
    let sql = "";
    sql += `insert into mz_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,sjlx,sfdd)
    SELECT case when TRIM(both '  ' FROM batch) is not null and TRIM(both '  ' FROM batch) !='' then TRIM(both '  ' FROM batch) else '0' end::bigint batch, 
    ryid, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    case when TRIM(both '  ' FROM gfsh) is not null and TRIM(both '  ' FROM gfsh) !='' then TRIM(both '  ' FROM gfsh) else '0' end zzhm, 
     TRIM(both '  ' FROM gfgsmc) khmc,'dz1' zzlx,'企业法人营业执照' zzlxmc ,'98' sjlx, 
    '1' sfdd 
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  and gfsh is not null and gfsh != '' ;`;
    sql += `insert into mz_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,sjlx,sfdd)
    SELECT case when TRIM(both '  ' FROM batch) is not null and TRIM(both '  ' FROM batch) !='' then TRIM(both '  ' FROM batch) else '0' end::bigint batch, 
    ryid, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    case when TRIM(both '  ' FROM xfsh) is not null and TRIM(both '  ' FROM xfsh) !='' then TRIM(both '  ' FROM xfsh) else '0' end zzhm, 
     TRIM(both '  ' FROM xfgsmc) khmc,'dz1' zzlx ,'企业法人营业执照' zzlxmc ,'98' sjlx, 
    '1' sfdd 
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  and xfsh is not null and xfsh != '';`;
    return sql;
  },
  // 数据抽取
  extractDataFromTempTable: async function (ajid, tempTableName, mbdm, sjlyid) {
    const client = await global.pool.connect();
    try {
      console.log(
        "extractDataFromTempTable:",
        ajid,
        tempTableName,
        mbdm,
        sjlyid
      );
      await cases.SwitchCase(client, ajid);
      let sql = "";
      if (mbdm === "110002") {
        // 通用模版
        sql = await this.extractSqlByGasbankrecords(tempTableName, sjlyid);
      } else if (mbdm === "130002") {
        // 反洗钱模版
        sql = await this.extractDataByFanxiqianTable(tempTableName, sjlyid);
      } else if (mbdm === "10100001011") {
        // 税务登记表 mz_tax_swdj
        sql = await this.extractDataBymz_tax_swdj(tempTableName, sjlyid);
      } else if (mbdm === "150001") {
        //进销项税务 mz_tax_records_150001
        sql = await this.extractDataBymz_tax_records(tempTableName, sjlyid);
      }
      console.log(sql);
      await client.query(sql);

      return { success: true };
    } finally {
      client.release();
    }
  },
  UpdateIpFields: async function (ajid, sjlyids, mbdm) {
    if (mbdm === "110002") {
      const client = await global.pool.connect();
      await cases.SwitchCase(client, ajid);
      try {
        let sql = `update mz_bank_records set ipgj='', ipsf='', ipcs='', ipdq='' WHERE ajid=${ajid} and sjlyid in ('${sjlyids}')
         and (ipgj is NULL or ipsf is NULL or ipcs is NULL or ipdq is NULL);`;
        console.log(sql);
        await client.query(sql);
        return { success: true };
      } finally {
        client.release();
      }
    }
  },

  // 展示目标表的结构
  showTableStruct: async function (ajid, tableName) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchCase(client, ajid);
      let sql = `SELECT DISTINCT a.attnum,
      a.attname AS field,
      t.typname AS type,
      a.attlen AS length,
      a.atttypmod AS lengthvar,
      a.attnotnull AS notnull,
      b.description AS comment
      FROM pg_class c,
      pg_attribute a
      LEFT OUTER JOIN pg_description b ON a.attrelid=b.objoid AND a.attnum = b.objsubid,
      pg_type t
      WHERE c.relname = '${tableName}'
      and a.attnum > 0
      and a.attrelid = c.oid
      and a.atttypid = t.oid
      ORDER BY a.attnum;`;
      let resultList = [];
      let res = await client.query(sql);
      for (let row of res.rows) {
        let obj = {};
        if (row.type.indexOf("char") !== -1) {
          obj.fieldtype = 1;
          obj.fieldename = row.field.toLowerCase();
        } else if (
          row.type.indexOf("int") !== -1 ||
          row.type.indexOf("num") !== -1 ||
          row.type.indexOf("float") !== -1 ||
          row.type.indexOf("double") !== -1 ||
          row.type.indexOf("byte") !== -1 ||
          row.type.indexOf("bool") !== -1 ||
          row.type.indexOf("bit") !== -1 ||
          row.type.indexOf("money") !== -1
        ) {
          obj.fieldtype = 2;
          obj.fieldename = row.field.toLowerCase();
        } else if (row.type.indexOf("timestamp") !== -1) {
          obj.fieldtype = 4;
          obj.fieldename = row.field.toLowerCase();
        }
        resultList.push(obj);
      }
      return { success: true, rows: resultList };
    } finally {
      client.release();
    }
  },
  // 根据文件全列查找之前匹配的数据
  QueryMatchedRecordByFileAllCols: async function (matchedmbdm, fileAllColList) {
    if (fileAllColList.length === 0 || matchedmbdm === "")
      return { success: false, rows: [] };
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let filecols_str = fileAllColList.join("&");
      let md5_str = crypto
        .createHash("md5")
        .update(filecols_str)
        .digest("hex");
      let sql = `select * from icap_base.mz_match_file_record where md5='${md5_str}' and matchedmbdm='${matchedmbdm}'`;
      let res = await client.query(sql);
      if (res.rows.length > 0) {
        return {
          success: true,
          rows: res.rows[0].dbfields.split("&"),
          inFlag: res.rows[0].inflag,
          outFlag: res.rows[0].outflag,
        };
      } else {
        return { success: false, rows: [] };
      }
    } finally {
      client.release();
    }
  },
  InsertOrUpdateMatchedRecord: async function (
    matchedmbdm,
    filecolsList,
    matchfieldsList,
    inflag,
    outflag
  ) {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let createFields = [
        "md5",
        "matchedmbdm",
        "filefields",
        "dbfields",
        "matchcount",
        "inflag",
        "outflag",
        "datetime",
      ];
      if (filecolsList.length === 0 || matchfieldsList.length === 0) return;
      let filecols_str = filecolsList.join("&");
      let md5_str = crypto
        .createHash("md5")
        .update(filecols_str)
        .digest("hex");
      let matchedCount = matchfieldsList.filter((field) => field !== "").length;
      let matchfields_str = matchfieldsList.join("&");
      let values = [
        md5_str,
        matchedmbdm,
        filecols_str,
        matchfields_str,
        matchedCount,
        inflag,
        outflag,
        new Date().Format("yyyy-MM-dd hh:mm:ss"),
      ];
      let sql = `INSERT INTO icap_base.mz_match_file_record(${createFields})
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      ON conflict(md5) DO UPDATE
      set 
      matchedmbdm = excluded.matchedmbdm,
      filefields = excluded.filefields, 
      dbfields = excluded.dbfields, 
      matchcount = excluded.matchcount, 
      inflag = excluded.inflag, 
      outflag = excluded.outflag, 
      datetime = excluded.datetime`;
      await client.query(sql, values);
    } catch (err) {
      console.log("InsertOrUpdateMatchedRecord:", err)
    }
    finally {
      client.release();
    }
  },
};
