const log = require("electron-log");
import cases from "./Cases";
export default {
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
      const res = await client.query(sql);
      console.log(res);
      client.release();
    } catch (e) {
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
