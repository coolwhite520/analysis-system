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
    let sql = `SELECT count(*),mbdm from (SELECT fieldcname, tableename,mbdm  from (SELECT  fieldcname, tableename,mbdm from  
      st_data_template_createfield  union SELECT fieldcname, tableename, mbdm from 
      st_data_template_field union SELECT columnname as fieldcname, 'ff' as tableename,mbdm  from  gas_match_log)D where mbdm  in 
    (SELECT mbdm FROM st_data_template A INNER JOIN layout_table_info B on      
      (upper(B.tablename)=upper(A.tablecname)  or upper(B.tablename||'_source')=upper(A.tablecname) ) 
       where pdm='${pdm}'
       AND tablecname is not null AND tablecname != '' and ishide='0' and     
      ('200'=any(regexp_split_to_array(B.menu_vids,','))=TRUE or '0'=any(regexp_split_to_array(B.menu_vids,','))=TRUE )  GROUP BY(mbdm,mbmc,pdm) ORDER BY pdm 
       ) AND position(','||fieldcname||',' in '${fileField}' )> 0 ORDER BY tableename)B GROUP BY B.mbdm ORDER BY count desc   
`;
    console.log(sql);
    const res = await db.query(sql);
    console.log(res);
    if (res.rows.length > 0) {
      return res.rows[0].mbdm;
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
       '小智', '${mbmc}', '${tablecname}', '${softVersion}');`;
      console.log(sql);
      const res = await db.query(sql);
      console.log(res);
      return true;
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
      let like = `${tablecname}_${mbdm}`;
      let valueName = (await this.showLikeTempTableCount(ajid, like)) + 1;
      let createTableName = `${like}_${valueName}_temp`;
      let newFields = fields.map(function(item) {
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
      const res = await db.query(sql);
      return true;
    } catch (e) {
      return false;
    }
  },
};
