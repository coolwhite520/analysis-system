const log = require("electron-log");
const fs = require("fs");

import cases from "./Cases";
export default {
  GetModelSql: async (tid) => {
    const client = await global.pool.connect();
    try {
      let sql = `SET search_path TO icap_base`;
      await client.query(sql);
      sql = "SELECT * FROM layout_model_info WHERE MID='" + tid + "'";
      const res = await client.query(sql);
      return {
        gpsqltemplate: res.rows[0]["gpsqltemplate"],
        orderby: res.rows[0]["orderby"],
      }; //id , parent_id, name
    } finally {
      client.release();
    }
  },
  QueryCustom: async function(sql, ajid = "") {
    const client = await global.pool.connect();
    try {
      if (ajid) {
        await cases.SwitchCase(client, ajid);
      } else {
        await cases.SwitchDefaultCase(client);
      }
      const res = await client.query(sql);
      // console.log("queryCustom:", res);
      return {
        success: true,
        rows: res.rows ? res.rows : [],
        fields: res.fields ? res.fields.map((field) => field.name) : [],
      };
    } catch (e) {
      console.log({ sql, e });
      return { success: false, rows: [], fields: [] };
    } finally {
      client.release();
    }
  },
  // 创建聚合函数
  CreateAggregateFunction: async function() {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `create aggregate group_concat (anyelement)
        (
        sfunc = array_append,
        stype = anyarray,
        initcond='{}'
        );`;
      await client.query(sql);
    } catch (e) {
      console.log(e);
    } finally {
      client.release();
    }
  },
  // 创建匹配记录表
  CreateFileMatchedTable: async function() {
    const client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let createTableName = "gas_match_file_record";
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
      let newFields = createFields.map(function(item, index) {
        if (item === "md5") {
          return `${item} varchar(80) not null PRIMARY KEY`;
        } else if (item === "datetime") {
          return `${item} timestamp`;
        } else if (item === "matchcount") {
          return `${item} int`;
        }
        return `${item} TEXT`;
      });
      let fieldsStr = newFields.join(",");
      let sql = `CREATE TABLE IF NOT EXISTS ${createTableName} (${fieldsStr})`;
      console.log(sql);
      await client.query(sql);
    } finally {
      client.release();
    }
  },
  existGasDataBase: async function() {
    const client = await pool.connect();
    try {
      let sql = `SELECT client.query pg_catalog.pg_database u where u.datname='gas_data';`;
      let res = await client.query(sql);
      if (res.rows[0].datname === "gas_data") {
        return true;
      }
      return false;
    } finally {
      client.release();
    }
  },
  // 修改默认库中话单数据的数据导入项，新增 ddfzsxm（调单方真实姓名）,dfzsxm （对方真实姓名）
  insertDefaultToPhoneCallBase: async function() {
    const client = await pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      // 先查询，看是否存在id 为 122800 和 122801 的数据
      let sqlSelect = `select count(*)::int count from st_data_template_field where id in (122800, 122801)`;
      let ret = await client.query(sqlSelect);
      if (ret.rows[0].count === 0) {
        let sql = `INSERT INTO "st_data_template_field" ("id", "mbdm", "tableename", "fieldcname", "fieldename", "fieldtype", "fieldlength") VALUES (122800, '220001', 'GAS_PHONE_CALL_INFO', '调单方真实姓名', 'DDFZSXM', 1, 100);
        INSERT INTO "st_data_template_field" ("id", "mbdm", "tableename", "fieldcname", "fieldename", "fieldtype", "fieldlength") VALUES (122801, '220001', 'GAS_PHONE_CALL_INFO', '对方真实姓名', 'DFZSXM', 1, 100);
         `;
        await client.query(sql);
      }
    } catch (e) {
    } finally {
      client.release();
    }
  },
};
