const log = require("electron-log");

export default {
  existGasDataBase: async function() {
    try {
      let sql = `SELECT u.datname  FROM pg_catalog.pg_database u where u.datname='gas_data';`;
      let res = await global.pool.query(sql);
      if (res.rows[0].datname === "gas_data") {
        return true;
      }
      return false;
    } catch (e) {
      log.info(e);
      return false;
    }
  },
};
