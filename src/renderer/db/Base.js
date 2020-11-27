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
      return { success: true, rows: res.rows };
    } catch (e) {
      console.log({ sql, e });
      return { success: false, rows: [] };
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
};
