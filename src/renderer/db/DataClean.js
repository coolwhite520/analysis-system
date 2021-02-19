import cases from "./Cases";
const log = require("electron-log");

export default {
  queryRulesFromTable: async function(
    tableename,
    rule_type,
    SelectDataSourceType
  ) {
    let client = await global.pool.connect();
    try {
      await cases.SwitchDefaultCase(client);
      let sql = `SELECT * FROM mz_datarules WHERE rule_type='${rule_type}' AND rule_datatype ='${tableename}'`;
      if (SelectDataSourceType == 1) {
        //DataSourceType.Person
        sql += " and tid>=2000 AND tid<3000 ";
      } else if (SelectDataSourceType == 2) {
        //DataSourceType.Unit
        sql += " and tid>=3000 AND tid<4000 ";
      } else if (SelectDataSourceType == 14) {
        // DataSourceType.TaxDetail
        sql += " and tid>=5012 AND tid<5013 ";
      }
      sql += " order by tid asc";
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
