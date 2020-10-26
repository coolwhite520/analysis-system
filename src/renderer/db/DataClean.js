import cases from "./Cases";
const log = require("electron-log");

export default {
  queryRulesFromTable: async function(tableename, rule_type) {
    let client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT * FROM gas_datarules WHERE rule_type='${rule_type}' AND rule_datatype ='${tableename}' order by tid asc  `;
      console.log(sql);
      let ret = await client.query(sql);
      return { success: true, rows: ret.rows };
    } catch (e) {
      log.info("queryRulesFromTable:", e.message);
      return { success: false, rows: [], err: e.message };
    } finally {
      client.release();
    }
  },
};
