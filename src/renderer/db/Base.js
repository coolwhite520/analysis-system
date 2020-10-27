const log = require("electron-log");
var copyTo = require("pg-copy-streams").to;
const fs = require("fs");

import cases from "./Cases";
export default {
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
