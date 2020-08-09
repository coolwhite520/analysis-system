import db from "./db";
import cases from "./Cases";

export default {
  // 根据导入数据类型获取对应的匹配表
  QueryMatchTableListByPdm: async function(pdm) {
    await cases.SwitchDefaultCase();
    let sql = `select *  from  st_data_template  where pdm='${pdm}' order by MBMC;`;
    const res = await db.query(sql);
    console.log(sql, res);
    return res.rows; // id, mbdm, mbmc, tablename ...
  },
  // 根据模版代码获取对应的列名称
  QueryColsNameByMbdm: async function(mbdm) {
    await cases.SwitchDefaultCase();
    let sql = `SELECT ID,MBDM,TABLEENAME,FIELDCNAME,FIELDENAME,FIELDTYPE,
    fieldlength FROM st_data_template_field where MBDM = '${mbdm}' order by FIELDCNAME asc `;
    const res = await db.query(sql);
    console.log(sql, res);
    return res.rows; // id, fieldcname, fieldename, ...
  },
  // 根据模版代码获取log表对应的列名称
  QueryInfoFromLogMatchByMbdm: async function(mbdm) {
    await cases.SwitchDefaultCase();
    let sql = `SELECT ID, MBDM, COLUMNNAME,FIELDNAME FROM gas_match_log where MBDM = '${mbdm}'`;
    const res = await db.query(sql);
    console.log(sql, res);
    return res.rows; // id, fieldcname, fieldename, ...
  },
  // 自动匹配字段
  // ,账号开户银行,账号开户日期,账号开户名称,银行账号,通信地址,联系电话,开户人证件类型,开户人证件号码,开户人国籍,开户联系方式,代理人电话,代理人,,
  QueryBestMatchMbdm: async function(pdm, fileField) {
    await cases.SwitchDefaultCase();
    let sql = "";
    if (pdm.length > 0) {
      sql = `SELECT count(*),mbdm from (SELECT fieldcname, tableename,mbdm  from (SELECT  fieldcname, tableename,mbdm from  
        st_data_template_createfield  union SELECT fieldcname, tableename, mbdm from 
        st_data_template_field union SELECT columnname as fieldcname, 'ff' as tableename,mbdm  from  gas_match_log)D where mbdm  in 
      (SELECT mbdm FROM st_data_template A INNER JOIN layout_table_info B on      
        (upper(B.tablename)=upper(A.tablecname)  or upper(B.tablename||'_source')=upper(A.tablecname) ) 
         where pdm='${pdm}'
         AND tablecname is not null AND tablecname != '' and ishide='0' and     
        ('200'=any(regexp_split_to_array(B.menu_vids,','))=TRUE or '0'=any(regexp_split_to_array(B.menu_vids,','))=TRUE )  GROUP BY(mbdm,mbmc,pdm) ORDER BY pdm 
         ) AND position(','||fieldcname||',' in '${fileField}' )> 0 ORDER BY tableename)B GROUP BY B.mbdm ORDER BY count desc;`;
    } else {
      sql = `SELECT count(*),mbdm from (SELECT fieldcname, tableename,mbdm  from (SELECT  fieldcname, tableename,mbdm from  
        st_data_template_createfield  union SELECT fieldcname, tableename, mbdm from 
        st_data_template_field union SELECT columnname as fieldcname, 'ff' as tableename,mbdm  from  gas_match_log)D where mbdm  in 
      (SELECT mbdm FROM st_data_template A INNER JOIN layout_table_info B on      
        (upper(B.tablename)=upper(A.tablecname)  or upper(B.tablename||'_source')=upper(A.tablecname) ) 
         where tablecname is not null AND tablecname != '' and ishide='0' and     
        ('200'=any(regexp_split_to_array(B.menu_vids,','))=TRUE or '0'=any(regexp_split_to_array(B.menu_vids,','))=TRUE )  GROUP BY(mbdm,mbmc,pdm) ORDER BY pdm 
         ) AND position(','||fieldcname||',' in '${fileField}' )> 0 ORDER BY tableename)B GROUP BY B.mbdm ORDER BY count desc;`;
    }
    let mbdm = "";
    console.log(sql);
    const res = await db.query(sql);
    console.log(res);
    if (res.rows.length > 0) {
      mbdm = res.rows[0].mbdm;
      if (pdm === "") {
        sql = `select pdm from st_data_template where mbdm='${mbdm}'`;
        console.log(sql);
        let ret = await db.query(sql);
        pdm = ret.rows[0].pdm;
      }
      return { mbdm, pdm };
    }
    return "";
  },
  // fileExt --> 不包含.
  insertBatch: async function(
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
    try {
      await cases.SwitchDefaultCase();
      ajid = parseInt(ajid);
      let now = new Date().Format("yyyy-MM-dd hh:mm:ss");
      let sql = `INSERT INTO "icap_base"."st_data_source"("sjly", "jh", "drrq", "ajid", "jgid", 
      "ajmc", "filetype", "filename", "filepath", "mbdm", "batch", "sjl", "fl", "md5", "erropath", 
      "sheetname", "name", "mbmc", "tablecname", "versionsnum") VALUES 
      ('', '00000000', '${now}', ${ajid}, '', '${ajmc}', '${fileExt}', '${filename}',
       '${filepath}', '${mbdm}', ${batch}, 0, 0, '', '', '${sheetname}', 
       '小智', '${mbmc}', '${tablecname}', '${softVersion}') returning sjlyid;`;
      console.log(sql);
      const res = await db.query(sql);
      console.log(res.rows);
      return res.rows[0].sjlyid;
    } catch (e) {
      return false;
    }
  },
  // 查询scheme下的所有表名称
  showLikeTempTableCount: async function(ajid, like) {
    let sql = `SELECT count(table_name)::int count FROM information_schema.tables
     WHERE table_schema = 'icap_${ajid}' 
     and table_name like '%${like}%' 
     and POSITION ( '_temp' IN TABLE_NAME ) > 0;`;
    console.log(sql);
    const res = await db.query(sql);
    console.log(res);
    return res.rows[0].count;
  },
  // 数据导入的时候创建临时表
  createTempTable: async function(ajid, tablecname, mbdm, fields) {
    try {
      if (tablecname.endsWith("_source")) {
        tablecname = tablecname.slice(0, tablecname.lastIndexOf("_source"));
      }
      let like = `${tablecname}_${mbdm}`;
      let valueName = (await this.showLikeTempTableCount(ajid, like)) + 1;
      let createTableName = `${like}_${valueName}_temp`;

      // 查询全字段
      await cases.SwitchDefaultCase();
      let createFields = JSON.parse(JSON.stringify(fields));
      let allFieldRows = await this.QueryColsNameByMbdm(mbdm);
      for (let fieldRow of allFieldRows) {
        if (!createFields.includes(fieldRow.fieldename.toLowerCase())) {
          createFields.push(fieldRow.fieldename.toLowerCase());
        }
      }
      let newFields = createFields.map(function(item) {
        return `"${item}" varchar(1000)`;
      });
      let fieldsStr = newFields.join(",");
      await cases.SwitchCase(ajid);
      let sql = `DROP TABLE IF EXISTS ${createTableName};
      CREATE TABLE IF NOT EXISTS ${createTableName} (${fieldsStr})`;
      console.log(sql);
      const res = await db.query(sql);
      console.log(res);
      return createTableName;
    } catch (e) {
      console.log(e.message);
      return false;
    }
  },
  // 插入一条数据
  importOneRowData: async function(createdTableName, fields, data) {
    try {
      let sql = `insert into ${createdTableName}(${fields}) VALUES(${data})`;
      console.log(sql);
      const res = await db.query(sql);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  // 查询temp表中的数据
  queryDataFromTable: async function(
    ajid,
    tableName,
    matchedFields,
    beginIndex,
    limit,
    filterList,
    headers // 包含字段的所有属性
  ) {
    // 展示的时候需要行号， 所以查询的时候需要添加到select中
    matchedFields = ["rownum"].concat(matchedFields);
    let newRows = [];
    let errorFields = [];
    try {
      await cases.SwitchCase(ajid);
      let sql = `select ${matchedFields} from ${tableName}`;
      if (filterList.length === 0) {
        sql = sql + ` limit ${limit} OFFSET ${beginIndex}`;
        console.log(sql);
        const res = await db.query(sql);
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
        for (let item of headers) {
          if (
            filterList.find((el) => {
              return el === "exceedLen";
            }) &&
            item.fieldtype === 1
          ) {
            let temp = await this.QueryFieldExceedLengthRows(
              ajid,
              tableName,
              matchedFields,
              item.fieldename,
              item.fieldlength
            );
            if (temp.success && temp.rows.length > 0) {
              let rownums = [];
              for (let row of temp.rows) {
                let newRow = [];
                rownums.push(row["rownum"]);
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
              errorFields.push({
                filterName: "exceedLen",
                fieldcname: item.fieldcname,
                fieldlength: item.fieldlength,
                fieldename: item.fieldename.toLowerCase(),
                rownums,
              });
            }
          }
          if (
            filterList.find((el) => {
              return el === "notNum";
            }) &&
            (item.fieldtype === 2 || item.fieldtype === 3)
          ) {
            let temp = await this.QueryFieldNotNumberRows(
              ajid,
              tableName,
              matchedFields,
              item.fieldename
            );
            if (temp.success && temp.rows.length > 0) {
              let rownums = [];
              for (let row of temp.rows) {
                let newRow = [];
                rownums.push(row["rownum"]);
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
              errorFields.push({
                filterName: "notNum",
                fieldcname: item.fieldcname,
                fieldename: item.fieldename.toLowerCase(),
                rownums,
              });
            }
          }
          if (
            (filterList.find((el) => {
              return el === "notDate";
            }) &&
              item.fieldtype === 4) ||
            item.fieldtype === 6
          ) {
            let temp = await this.QueryFieldNotDateRows(
              ajid,
              tableName,
              matchedFields,
              item.fieldename
            );
            if (temp.success && temp.rows.length > 0) {
              let rownums = [];
              for (let row of temp.rows) {
                rownums.push(row["rownum"]);
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
              errorFields.push({
                filterName: "notDate",
                fieldcname: item.fieldcname,
                fieldename: item.fieldename.toLowerCase(),
                rownums,
              });
            }
          }
        }
      }
      //格式化数据
      return { rows: newRows, success: true, errorFields };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 查询条目数量
  queryRowsum: async function(ajid, tableName) {
    try {
      await cases.SwitchCase(ajid);
      let sql = `select count(*)::int count from ${tableName}`;
      console.log(sql);
      const res = await db.query(sql);
      console.log(res.rows);
      return res.rows[0].count;
    } catch (e) {
      console.log(e);
      return 0;
    }
  },

  // 查询不是数的条目
  QueryFieldNotNumberRows: async function(
    ajid,
    tableName,
    matchedFields,
    fieldName
  ) {
    let success = true;
    try {
      await cases.SwitchCase(ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} WHERE not icap_base.isnumeric(${fieldName});`;
      console.log(sql);
      const res = await db.query(sql);
      return { rows: res.rows, success };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 查询字段的长度不合法的条目
  QueryFieldExceedLengthRows: async function(
    ajid,
    tableName,
    matchedFields,
    fieldName,
    fieldLength
  ) {
    let success = true;
    try {
      await cases.SwitchCase(ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} WHERE LENGTH(TRIM(both '  ' FROM ${fieldName}))>${fieldLength};`;
      console.log(sql);
      const res = await db.query(sql);
      return { rows: res.rows, success };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 查询字段非日期的条目
  QueryFieldNotDateRows: async function(
    ajid,
    tableName,
    matchedFields,
    fieldName
  ) {
    let success = true;
    try {
      await cases.SwitchCase(ajid);
      let sql = `SELECT ${matchedFields} from ${tableName} 
      WHERE not icap_base.istimestamp(TRIM(both '  ' FROM ${fieldName})) 
      and TRIM(both '  ' FROM ${fieldName}) is not null
      and TRIM(both '  ' FROM ${fieldName}) !=''; `;
      console.log(sql);
      const res = await db.query(sql);
      return { rows: res.rows, success };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 更新错误的数据
  updateErrorRows: async function(ajid, tableName, field, newValue, rownums) {
    try {
      await cases.SwitchCase(ajid);
      rownums = rownums.map((el) => {
        return `'${el}'`;
      });
      let sql = `update ${tableName} set ${field} = '${newValue}' where rownum in (${rownums})`;
      console.log(sql);
      const res = await db.query(sql);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  },
  // delete错误的数据
  deleteErrorRows: async function(ajid, tableName, rownums) {
    try {
      await cases.SwitchCase(ajid);
      rownums = rownums.map((el) => {
        return `'${el}'`;
      });
      let sql = `delete from ${tableName} where rownum in (${rownums})`;
      console.log(sql);
      const res = await db.query(sql);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  },
  // 根据通用模版抽取数据到别的表中。
  extractSqlByGasbankrecords: async function(tempTableName, sjlyid) {
    let sql = "";
    // 抽取到人员信息表中
    sql += `INSERT INTO gas_person ( batch, ryid, ajid, sjlylx, sjlyid, zzhm, khmc, zzlx, zzlxmc, ckztlb, sjlx, sfdd ) SELECT
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
           LIMIT 200000 OFFSET 0 
         ) tt 
       WHERE
         tt.jyzjhm != '0' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1; `;

    sql += `INSERT INTO gas_person ( batch, ryid, ajid, sjlylx, sjlyid, zzhm, khmc, zzlx, zzlxmc, ckztlb, sjlx, sfdd ) SELECT
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
           LIMIT 200000 OFFSET 0 
         ) tt 
       WHERE
         tt.jydfzjhm != '0' 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;

    sql += `INSERT INTO gas_account_info ( batch, ryid, ajid, sjlylx, sjlyid, zh, kh, zhkhmc, khrzjhm, zhkhyh ) SELECT
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
         LIMIT 200000 OFFSET 0 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;

    sql += `INSERT INTO gas_account_info ( batch, ryid, ajid, sjlylx, sjlyid, zh, kh, zhkhmc, khrzjhm, zhkhyh ) SELECT
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
         LIMIT 200000 OFFSET 0 
       ) ss 
     WHERE
       ss.ROW_NUMBER = 1;`;
    return sql;
  },

  // 根据反洗钱表中的temp数据抽取
  extractDataByFanxiqianTable: async function(tempTableName, sjlyid) {
    let sql = "";
    // 先抽取到account表
    sql += `INSERT into gas_account_info (batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh) 
    SELECT batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh  from ( SELECT TRIM(both '  ' FROM batch)::bigint batch,ryid, 
    TRIM(both '  ' FROM ajid)::bigint ajid,'数据抽取' sjlylx,TRIM(both '  ' FROM sjlyid)::bigint sjlyid, 
    TRIM(both '  ' FROM cxzh) zh,TRIM(both '  ' FROM cxkh) kh,TRIM(both '  ' FROM jymc) zhkhmc,TRIM(both '  ' FROM jyzjhm) khrzjhm, 
    TRIM(both '  ' FROM jykhh) zhkhyh, 
     row_number() OVER(PARTITION BY ajid,sjlylx,sjlyid,cxzh,cxkh,jymc,jyzjhm ) from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  AND 
    cxzh is not null and cxzh != '' and cxkh is not null and cxkh != ''  limit 200000 offset 0)  ss where   ss.ROW_NUMBER = 1 
    ;`;
    sql += `INSERT into gas_account_info (batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh) 
    SELECT batch,ryid,ajid,sjlylx,sjlyid,zh,kh,zhkhmc,khrzjhm,zhkhyh from ( SELECT TRIM(both '  ' FROM batch)::bigint batch,ryid, 
    TRIM(both '  ' FROM ajid)::bigint ajid,'数据抽取' sjlylx,TRIM(both '  ' FROM sjlyid)::bigint sjlyid, 
    TRIM(both '  ' FROM jydfzkh) zh,TRIM(both '  ' FROM jydfzkh) kh,TRIM(both '  ' FROM jydfmc) zhkhmc,TRIM(both '  ' FROM jydfzjhm) khrzjhm, 
    TRIM(both '  ' FROM jydfzhkhh) zhkhyh, 
     row_number() OVER(PARTITION BY ajid,sjlylx,sjlyid,jydfzkh,jydfmc,jydfzjhm ) from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  AND 
    jydfzkh is not null and jydfzkh != ''   limit 200000 offset 0)  ss where   ss.ROW_NUMBER = 1; 
    `;
    //抽取数据到person表
    sql += `INSERT into gas_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
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
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}') and jydfzjhm is not null and jydfzjhm != '' and jydfmc is not null and jydfmc != ''  limit 200000 offset 0) tt  where tt.jydfzjhm!='0' ) ss where ss.ROW_NUMBER = 1 
    ;`;
    sql += `INSERT into gas_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
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
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}') and jyzjhm is not null and jyzjhm != '' and jymc is not null and jymc != ''  limit 200000 offset 0) tt  where tt.jyzjhm!='0' ) ss where ss.ROW_NUMBER = 1 
    ;`;
    return sql;
  },
  extractDataByGas_tax_swdj: async function(tempTableName, sjlyid) {
    let sql = "";
    //gas_person
    sql += `insert into gas_person(batch,ajid,sjlylx,sjlyid,zzhm,khmc,zcdz,jyd,frdbxm,frdbzjhm,zczb,jyfw,yyksqx,yyjsqx,frdbzjlx,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
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
    where SJLYID IN('${sjlyid}') and nssbh is not null and nssbh!=''  limit 200000 offset 0;`;

    sql += `insert into gas_person(batch,ajid,sjlylx,sjlyid,khmc,zzhm,lxsj,lxdh,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
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
    where SJLYID IN('${sjlyid}') and fddbrsfzh is not null and fddbrsfzh!='' limit 200000 offset 0;`;

    sql += `insert into gas_person(batch,ajid,sjlylx,sjlyid,khmc,zzhm,lxsj,lxdh,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
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
    where SJLYID IN('${sjlyid}')  and cwsfzh is not null and cwsfzh!='' limit 200000 offset 0 ;`;

    sql += `insert into gas_person(batch,ajid,sjlylx,sjlyid,khmc,zzhm,lxsj,lxdh,ryid,zzlx,zzlxmc,ckztlb,sjlx,sfdd)
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
    where SJLYID IN('${sjlyid}') and bsrsfzh is not null and bsrsfzh!='' limit 200000 offset 0 ;`;
  },
  extractDataByGas_tax_records: async function(tempTableName, sjlyid) {
    let sql = "";
    sql += `insert into gas_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,sjlx,sfdd)
    SELECT case when TRIM(both '  ' FROM batch) is not null and TRIM(both '  ' FROM batch) !='' then TRIM(both '  ' FROM batch) else '0' end::bigint batch, 
    ryid, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    case when TRIM(both '  ' FROM gfsh) is not null and TRIM(both '  ' FROM gfsh) !='' then TRIM(both '  ' FROM gfsh) else '0' end zzhm, 
     TRIM(both '  ' FROM gfgsmc) khmc,'dz1' zzlx,'企业法人营业执照' zzlxmc ,'98' sjlx, 
    '1' sfdd 
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  and gfsh is not null and gfsh != '' limit 200000 offset 0 ;`;
    sql += `insert into gas_person(batch,ryid,ajid,sjlylx,sjlyid,zzhm,khmc,zzlx,zzlxmc,sjlx,sfdd)
    SELECT case when TRIM(both '  ' FROM batch) is not null and TRIM(both '  ' FROM batch) !='' then TRIM(both '  ' FROM batch) else '0' end::bigint batch, 
    ryid, case when TRIM(both '  ' FROM ajid) is not null and TRIM(both '  ' FROM ajid) !='' then TRIM(both '  ' FROM ajid) else '0' end::bigint ajid, 
    '数据抽取' sjlylx, case when TRIM(both '  ' FROM sjlyid) is not null and TRIM(both '  ' FROM sjlyid) !='' then TRIM(both '  ' FROM sjlyid) else '0' end::bigint sjlyid,  
    case when TRIM(both '  ' FROM xfsh) is not null and TRIM(both '  ' FROM xfsh) !='' then TRIM(both '  ' FROM xfsh) else '0' end zzhm, 
     TRIM(both '  ' FROM xfgsmc) khmc,'dz1' zzlx ,'企业法人营业执照' zzlxmc ,'98' sjlx, 
    '1' sfdd 
    from ${tempTableName} WHERE SJLYID IN('${sjlyid}')  and xfsh is not null and xfsh != '' limit 200000 offset 0 
    `;
  },
  // 数据抽取
  extractDataFromTempTable: async function(ajid, tempTableName, mbdm, sjlyid) {
    try {
      await cases.SwitchCase(ajid);
      let sql = "";
      if (mbdm === "110002") {
        // 通用模版
        sql = await this.extractSqlByGasbankrecords(tempTableName, sjlyid);
      } else if (mbdm === "130002") {
        // 反洗钱模版
        sql = await this.extractDataByFanxiqianTable(tempTableName, sjlyid);
      } else if (mbdm === "10100001011") {
        // 税务登记表 gas_tax_swdj
        sql = await this.extractDataByGas_tax_swdj(tempTableName, sjlyid);
      } else if (mbdm === "150001") {
        //进销项税务 gas_tax_records_150001
        sql = await this.extractDataByGas_tax_records(tempTableName, sjlyid);
      }
      console.log(sql);
      await db.query(sql);
      return { success: true };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 展示目标表的结构
  showTableStruct: async function(ajid, tableName) {
    try {
      await cases.SwitchCase(ajid);
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
      let res = await db.query(sql);
      for (let row of res.rows) {
        let obj = {};
        if (row.type.includes("char")) {
          obj.fieldtype = 1;
          obj.fieldename = row.field.toLowerCase();
        } else if (row.type.includes("int") || row.type.includes("num")) {
          obj.fieldtype = 2;
          obj.fieldename = row.field.toLowerCase();
        } else {
          obj.fieldtype = 1;
          obj.fieldename = row.field.toLowerCase();
        }
        resultList.push(obj);
      }
      return { success: true, rows: resultList };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
  // 从临时表导入到真实表，需要考虑数据类型啊。。。。
  importDataFromTempTableToRealTable: async function(
    ajid,
    tempTableName,
    tableName,
    mbdm,
    publicFields,
    matchedFields,
    externFields,
    callback
  ) {
    try {
      let targetTableStruct = await this.showTableStruct(ajid, tableName);
      if (!targetTableStruct.success)
        return { success: false, msg: "select table struct error" };
      // 先查询所有数据
      await cases.SwitchCase(ajid);
      // 拼接当前temp表的所有字段
      let sjlyid = 0;
      let resFieldTypeList = [];
      let selectList = [];
      let fields = publicFields.concat(matchedFields).concat(externFields);
      fields = fields.map((el) => {
        return el.toLowerCase();
      });
      for (let field of fields) {
        let f = targetTableStruct.rows.find((item) => {
          return item.fieldename === field;
        });
        if (f) {
          resFieldTypeList.push(f);
          selectList.push(field);
        }
      }
      let sql = `select ${selectList} from ${tempTableName}`;
      console.log(sql);
      const res = await db.query(sql);
      for (let index = 0; index < res.rows.length; index++) {
        let row = res.rows[index];
        let values = [];
        for (let k in row) {
          if (k.toLowerCase() === "sjlyid") {
            sjlyid = row[k];
          }
          // 需要特殊判定ajid
          let obj = resFieldTypeList.find((el) => {
            return el.fieldename.toLowerCase() === k.toLowerCase();
          });
          if (
            obj.fieldtype === 1 ||
            obj.fieldtype === 4 ||
            obj.fieldtype === 6
          ) {
            values.push(`'${row[k].trimEnd()}'`);
          } else {
            let temValue = row[k].trimEnd() ? row[k].trimEnd() : 0;
            values.push(`${temValue}`);
          }
        }
        let insertSql = `insert into ${tableName} (${selectList}) values (${values})`;
        console.log(insertSql);
        await db.query(insertSql);
        let sumRow = res.rows.length;
        callback({ sumRow, index });
      }
      await this.extractDataFromTempTable(ajid, tempTableName, mbdm, sjlyid);
      callback({ sumRow: 100, index: 100 });
      return { success: true };
    } catch (e) {
      console.log(e);
      return { success: false, msg: e.message };
    }
  },
};
